import { useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { stringify } from 'postcss';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leya-backend-vercel.vercel.app';

// 假資料：之後可改為從 API 取得
// 節點類型：來源類型(category)，來源細項(source)，影響面向(impact)，感受(emotion)
const demoData = [];

// 轉為心智圖的階層資料：使用者 -> 來源類型 -> 來源細項
// 修改後的 buildHierarchy：建立 User -> A -> B -> C 結構
function buildHierarchy(records, userNickname = '使用者') {
  const emotionCounts = {};
  records.forEach(r => {
    const key = r.emotion || '無情緒';
    emotionCounts[key] = (emotionCounts[key] || 0) + 1;
  });

  // 根節點 (使用者)
  const root = {
    name: userNickname || '使用者',
    type: '',
    depth: 0,
    children: []
  };

  // 遍歷每一筆後端回傳的分析資料，建立單獨的路徑
  records.forEach((r, index) => {
    const emotionName = r.emotion || '無情緒';
    // Level 3: C (Consequence) - 情緒與影響
    // 這是最外層，也是我們主要互動(點擊)的對象
    const nodeC = {
      name: emotionName, // 顯示情緒
      detail: r.impact,                 // Tooltip 可顯示具體影響
      type: 'C (後果)',
      category: r.category,             // 繼承分類以便上色
      originalNote: r.note,             // 保存原始信念 (B) 供 REBT 使用
      originalSource: r.source,         // 保存原始事件 (A) 供 REBT 使用
      id: r.id || `record-${index}`,           // 唯一 ID
      totalFrequency: emotionCounts[emotionName] || 1, // 該情緒出現次數
      initialStress: r.current_stress !== undefined ? r.current_stress : 100, // 初始壓力值
      isResolved: r.is_resolved || false,
      dispute: r.user_dispute, 
      newBelief: r.new_belief
    };

    // Level 2: B (Belief) - 信念
    const nodeB = {
      name: r.note || '未偵測到信念',
      type: 'B (信念)',
      category: r.category,
      children: [nodeC] // B 連接 C
    };

    // Level 1: A (Activating Event) - 事件
    const nodeA = {
      name: r.source || '未知事件',
      type: 'A (事件)',
      category: r.category,
      children: [nodeB] // A 連接 B
    };

    // 將整條鏈掛到根節點下: Root -> A -> B -> C
    root.children.push(nodeA);
  });

  return { root };
}

export default function StressMindMap({
  data = demoData,
  height = 450,
  maxDepth,
  username,
  analysisData:
  externalAnalysisData,
  isLoading,
  error,
  userNickname,
  onNodeClick, //點擊事件
  stressStates = {}, //壓力狀態
}) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const analysisData = externalAnalysisData || data;

  const { root: hierarchyData } = useMemo(() => buildHierarchy(analysisData, userNickname), [analysisData, userNickname]);

  useEffect(() => {
    const container = containerRef.current;
    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll('*').remove();

    const width = container?.clientWidth ?? 960;
    // 手機寬度(<=768px)時，將高度限制到最多 300px
    const computeTargetHeight = () => (typeof window !== 'undefined' && window.innerWidth <= 768 ? Math.min(height, 300) : height);
    let targetHeight = computeTargetHeight();
    const svg = svgEl.attr('width', width).attr('height', targetHeight);

    const containerG = svg.append('g');
    const initialScale = (typeof window !== 'undefined' && window.innerWidth <= 768) ? 0.8 : 1;
    const g = containerG
      .append('g')
      .attr('transform', `translate(${width / 2}, ${targetHeight / 2}) scale(${initialScale})`);

    const zoom = d3.zoom()
      .scaleExtent([0.5, 2.5])
      .translateExtent([[0, 0], [width, targetHeight]])
      .on('zoom', (event) => containerG.attr('transform', event.transform));
    svg.call(zoom);
    svg.on('dblclick.zoom', null);
    svg.on('wheel.zoom', (event) => { if (event.ctrlKey || event.metaKey) event.preventDefault(); });

    // 建立階層與徑向 cluster 佈局
    const root = d3.hierarchy(hierarchyData);
    // 若有設定最大層級，剪裁超出層級的子節點（root.depth=0）
    if (Number.isFinite(maxDepth)) {
      root.eachBefore((node) => {
        if (node.depth >= maxDepth) {
          node.children = null; // 刪除更深層
        }
      });
    }
    const computeCluster = (w, h) => {
      const radius = Math.min(w, h) / 2 - 24; // 留白
      const cluster = d3.cluster().size([2 * Math.PI, radius]);
      cluster(root);
    };
    computeCluster(width, targetHeight);

    const maxRadius = Math.min(width, targetHeight) / 2 - 40;
    root.each(d => {
      // d.y 代表離圓心的距離
      if (d.depth === 1) {
        // A (事件): 離圓心近一點 (例如 30% 的位置)
        d.y = maxRadius * 0.3; 
      } else if (d.depth === 2) {
        // B (信念): ★ 拉長 A 到 B 的距離 (放在 60% 的位置)
        d.y = maxRadius * 0.6; 
      } else if (d.depth === 3) {
        // C (後果): 最外圈 (100% 的位置)
        d.y = maxRadius; 
      }
    });

    const getNodeRadius = (d) => {
      // Depth 0: 使用者 (中心)
      if (d.depth === 0) return 24;

      // Depth 1: A (事件) - 稍微大一點，作為分支起點
      if (d.data.type === 'A (事件)') return 10;

      // Depth 2: B (信念) - 連接點，小一點
      if (d.data.type === 'B (信念)') return 10;

      // Depth 3: C (後果) - 這是主要壓力點，大小依據壓力狀態改變
      if (d.data.type === 'C (後果)') {
        // 優先讀取 stressStates (剛點擊完的狀態)，若無則讀取 initialStress (資料庫存的狀態)
        const keyName = d.data.originalSource || d.data.name; // 這裡要注意 key 的一致性
        // 注意：為了對應精準，建議用 ID，但目前 stressStates 是用 name 做 key。
        // 我們先維持用 name，但邏輯要加上 initialStress
        
        let stressValue = 100;
        if (stressStates[keyName] !== undefined) {
             stressValue = stressStates[keyName];
        } else if (d.data.initialStress !== undefined) {
             stressValue = d.data.initialStress;
        }

        const count = d.data.totalFrequency || 1;
        // 壓力小 (已療癒) 就不放大
        if (stressValue < 60) {
            return 12; // 回復到基礎大小
        }
        
        const size = 12 + (count * 3);
        return Math.min(size, 40);
      }

      return 10;
    };

    const originalColor = d3.scaleOrdinal().domain([0, 1, 2]).range(d3.schemeSet2);
    // 定義分類顏色映射 (可自定義更多顏色)
    const categoryColorScale = d3.scaleOrdinal(d3.schemeSet3);
    const getNodeColor = (d) => {
      // Depth 0: 使用者 (中心點) - 設為中性的灰藍色或原本的綠色
      if (d.depth === 0) return '#607D8B';

      // Depth 1: A (事件) - 紅色 (代表刺激/發生了什麼事)
      if (d.data.type === 'A (事件)') return '#4391dfff'; // 柔和紅

      // Depth 2: B (信念) - 青綠色 (代表你的想法橋樑)
      if (d.data.type === 'B (信念)') return '#a94ecdff'; // 青綠/綠松石色

      // Depth 3: C (後果) - 橘色 (代表情緒/壓力結果)
      if (d.data.type === 'C (後果)') {

        const keyName = d.data.originalSource || d.data.name;
        
        let stressValue = 100;
        if (stressStates[keyName] !== undefined) {
             stressValue = stressStates[keyName];
        } else if (d.data.initialStress !== undefined) {
             stressValue = d.data.initialStress;
        }

        // 如果壓力已緩解 (< 60)，變成平靜的淡綠色
        if (stressValue < 60) return '#66b786';

        const count = d.data.totalFrequency || 1;
        // 基礎橘色 '#FF9F43'
        // count 越大，darker 參數越大 (0.1 ~ 2.0)
        // 減 1 是因為 count 最小是 1，我們希望 1 的時候維持原色
        const t = Math.min((count - 1) / 5, 1);
        
        // 使用 D3 插值：從 橘色(#FF9F43) 變到 紅色(#FF0000)
        return d3.interpolateRgb('#FF9F43', '#FF0000')(t);
      }

      return '#e0e0e0'; // 未知類型的預設色
    };

    // 計算極座標 -> 直角座標，讓線與文字使用相同座標
    const toXY = (d) => {
      const angle = d.x - Math.PI / 2;
      return { x: Math.cos(angle) * d.y, y: Math.sin(angle) * d.y };
    };

    const linksData = root.links();
    const linkSel = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(linksData)
      .join('line')
      .attr('x1', d => toXY(d.source).x)
      .attr('y1', d => toXY(d.source).y)
      .attr('x2', d => toXY(d.target).x)
      .attr('y2', d => toXY(d.target).y)
      .attr('stroke', '#9aa0a6')
      .attr('stroke-opacity', 0.55)
      .attr('stroke-width', 1.5);

    const nodesData = root.descendants();

    const nodeCircleSel = g.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodesData)
      .join('circle')
      .attr('cx', d => toXY(d).x)
      .attr('cy', d => toXY(d).y)
      .attr('r', d => getNodeRadius(d))
      .attr('fill', d => getNodeColor(d))
      .attr('stroke', '#313131')
      .attr('stroke-width', 1)
      .style('filter', 'drop-shadow(0 1px 1px rgba(0,0,0,0.15))')
      .style('cursor', d => d.data.type === 'C (後果)' ? 'pointer' : 'default') // 滑鼠游標
      .on('click', (event, d) => {
        // 只有點擊最外層的「來源細項」才觸發 REBT
        if (d.data.type === '來源細項' && onNodeClick) {
          event.stopPropagation(); // 防止觸發 zoom
          onNodeClick(d.data);     // 傳遞點擊的資料給父層
        }
      });

    const labelsSel = g.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(nodesData)
      .join('text')
      .attr('x', d => {
        const p = toXY(d);
        // ★ 如果是 Root (使用者)，X 軸置中，不加偏移
        if (d.depth === 0) return p.x;
        
        // 其他節點維持左右偏移
        const offset = (p.x >= 0 ? 10 : -10);
        return p.x + offset;
      })
      
      // 2. Y 座標設定
      .attr('y', d => {
        const p = toXY(d);
        // ★ 如果是 Root，往上移動 (負值) 以顯示在圓圈正上方
        // 圓圈半徑是 24，我們往上移 35px 左右
        if (d.depth === 0) return p.y + 1;
        
        return p.y;
      })
      
      // 3. 文字對齊設定
      .attr('text-anchor', d => {
        // ★ 如果是 Root，強制置中對齊
        if (d.depth === 0) return 'middle';
        
        const p = toXY(d);
        return p.x >= 0 ? 'start' : 'end';
      })
      .style('dominant-baseline', 'middle')
      .style('font-size', '12px')
      .style('fill', d => d.depth === 0 ? '#fff' : '#2b2b2b')
      .style('paint-order', 'stroke')
      .style('stroke', 'white')
      .style('stroke', d => d.depth === 0 ? 'none' : 'white')
      .style('stroke-linejoin', 'round')
      .style('pointer-events', 'none')
      .text(d => {
        if (d.data.type === 'A (事件)' || d.data.type === 'B (信念)') return '';
        return d.data.name;
      });

    const tooltip = d3.select(container)
      .append('div')
      .style('position', 'absolute')
      .style('background', 'rgba(255,255,255,0.95)')
      .style('border', '1px solid #ddd')
      .style('border-radius', '8px')
      .style('padding', '8px 10px')
      .style('font-size', '12px')
      .style('box-shadow', '0 4px 10px rgba(0,0,0,0.08)')
      .style('max-width', '320px')
      .style('max-height', '220px')
      .style('overflow-y', 'auto')
      .style('opacity', 0)
      .style('pointer-events', 'none');

    const showTooltip = (event, html) => {
      tooltip.html(html)
        .style('left', `${event.offsetX + 12}px`)
        .style('top', `${event.offsetY - 12}px`)
        .transition().duration(120)
        .style('opacity', 1);
    };
    const hideTooltip = () => tooltip.transition().duration(180).style('opacity', 0);

    // Tooltip 綁定在節點圓圈
    nodeCircleSel.on('mouseover', (event, d) => {
      const circle = d3.select(event.currentTarget);
      circle.attr('r', getNodeRadius(d) + 4); // 放大效果

      // 組合 Tooltip 內容
      let content = `<strong>${d.data.name}</strong>`;

      if (d.data.type) {
        content += `<div style="margin-top:4px; font-size:10px; color:#666;">${d.data.type}</div>`;
      }

      const isHealed = d.data.type === 'C (後果)' && (d.data.isResolved || (d.data.initialStress && d.data.initialStress < 60));

      if (isHealed) {
        // --- 顯示 REBT 轉念成果 ---
        content += `<div style="margin-top:6px; padding-top:6px; border-top:1px dashed #ccc;">`;
        
        // 顯示駁斥 (D)
        if (d.data.dispute) {
          content += `<div style="margin-bottom:4px; font-size:11px; color:#555;">
            <span style="color:#e57373; font-weight:bold;">⚔️ 駁斥：</span>${d.data.dispute}
          </div>`;
        }
        
        // 顯示新觀點 (E)
        if (d.data.newBelief) {
          content += `<div style="font-size:11px; color:#555;">
            <span style="color:#4ECDC4; font-weight:bold;">🌱 新觀點：</span>${d.data.newBelief}
          </div>`;
        } else {
          // 如果沒有詳細文字，顯示預設訊息
          content += `<div style="font-size:11px; color:#4ECDC4;">✨ 已完成轉念療癒</div>`;
        }
        
        content += `</div>`;
      } else {
        // --- 未療癒：顯示原本的負面影響 ---
        if (d.data.type === 'C (後果)' && d.data.detail) {
          content += `<div style="margin-top:4px; border-top:1px solid #eee; padding-top:4px;">影響：${d.data.detail}</div>`;
        }
      }

      // 點擊提示
      if (d.data.type === 'C (後果)') {
        if (isHealed) {
           content += `<div style="margin-top:6px; color:#4ECDC4; font-weight:bold; font-size:10px;">(已解決)</div>`;
        } else {
           content += `<div style="margin-top:4px; color:#e57373; font-weight:bold;">👉 點擊進行轉念療癒</div>`;
        }
      }

      showTooltip(event, content);
    })
      .on('mouseout', (event, d) => {
        d3.select(event.currentTarget).attr('r', getNodeRadius(d));
        hideTooltip();
      })
      .on('click', (event, d) => {
        if (d.data.type === 'C (後果)' && onNodeClick) {
          
          // --- ★ 新增：檢查是否已療癒 ---
          const keyName = d.data.originalSource || d.data.name;
          let stressValue = 100;
          
          // 判斷目前的壓力值 (優先讀互動狀態，沒有則讀資料庫初始值)
          if (stressStates[keyName] !== undefined) {
             stressValue = stressStates[keyName];
          } else if (d.data.initialStress !== undefined) {
             stressValue = d.data.initialStress;
          }

          // 判斷標準：資料庫記為 isResolved 或壓力值 < 60
          const isHealed = d.data.isResolved || stressValue < 60;

          // ★ 關鍵邏輯：如果已經療癒，阻止點擊事件繼續傳遞，直接結束
          if (isHealed) {
             event.stopPropagation();
             // 手機上這會讓點擊只觸發 Tooltip 顯示成果，而不會打開 Modal
             return; 
          }
          // ---------------------------

          event.stopPropagation();

          // 未療癒 (紅色/橘色) 才執行以下開啟 Modal 的動作
          const rebtData = {
            id: d.data.id,
            name: d.data.originalSource || d.data.name, 
            event: d.data.originalSource, 
            belief: d.data.originalNote,  
            consequence: d.data.name,     
            impact: d.data.detail
          };

          onNodeClick(rebtData);
        }
      });

    const handleResize = () => {
      const newWidth = container?.clientWidth ?? width;
      const newHeight = computeTargetHeight();
      targetHeight = newHeight;
      svg.attr('width', newWidth).attr('height', newHeight);
      // 重新計算 cluster 佈局與更新座標（保留邊距空間讓文字不出框）
      computeCluster(newWidth, newHeight);
      // 重新置中群組
      const newScale = (typeof window !== 'undefined' && window.innerWidth <= 768) ? 1 : 1;
      g.attr('transform', `translate(${newWidth / 2}, ${newHeight / 2}) scale(${newScale})`);
      linkSel
        .attr('x1', d => toXY(d.source).x)
        .attr('y1', d => toXY(d.source).y)
        .attr('x2', d => toXY(d.target).x)
        .attr('y2', d => toXY(d.target).y);
      nodeCircleSel
        .attr('cx', d => toXY(d).x)
        .attr('cy', d => toXY(d).y)
        .attr('r', d => getNodeRadius(d));
      labelsSel
        .attr('x', d => {
          const p = toXY(d);
          const offset = (p.x >= 0 ? 10 : -10);
          return p.x + offset;
        })
        .attr('y', d => toXY(d).y)
        .attr('text-anchor', d => {
          const p = toXY(d);
          return p.x >= 0 ? 'start' : 'end';
        });
      // 更新縮放的平移限制
      zoom.translateExtent([[0, 0], [newWidth, newHeight]]);
    };
    const onResize = () => window.requestAnimationFrame(handleResize);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      tooltip.remove();
    };
  }, [hierarchyData, height, stressStates]);

  return (
    <div ref={containerRef} className='stress-container'>
      <svg ref={svgRef} />
    </div>
  );
}


