import { useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';

// 假資料：之後可改為從 API 取得
// 節點類型：來源類型(category)，來源細項(source)，影響面向(impact)，感受(emotion)
const demoData = [
  { category: '學業', source: '考試壓力', impact: '睡眠', emotion: '焦慮', note: '期末考臨近、準備不足' },
  { category: '學業', source: '報告負荷', impact: '時間管理', emotion: '壓迫', note: '同週多科報告' },
  { category: '人際', source: '與同儕衝突', impact: '情緒波動', emotion: '憤怒', note: '社團內部意見分歧' },
  { category: '家庭', source: '父母期待', impact: '自我價值', emotion: '自責', note: '對成績與升學的期待' },
  { category: '財務', source: '學費/生活費', impact: '打工時數', emotion: '焦慮', note: '兼顧課業與打工' },
  { category: '健康', source: '慢性疲勞', impact: '專注力', emotion: '倦怠', note: '長期睡眠不足' },
  { category: '人際', source: '社交焦慮', impact: '參與意願', emotion: '不安', note: '公開表達時心跳加速' },
  { category: '學業', source: '課程難度', impact: '成就感', emotion: '挫折', note: '高階課程理解困難' },
  { category: '家庭', source: '照顧責任', impact: '時間安排', emotion: '壓力', note: '需照顧家人' },
  { category: '未來', source: '職涯不確定', impact: '決策困難', emotion: '迷惘', note: '缺乏明確方向' },
];

// 轉為心智圖的階層資料：使用者 -> 來源類型 -> 來源細項
function buildHierarchy(records) {
  const categories = [...new Set(records.map(r => r.category))];
  const categoryToSources = new Map();
  const sourceToCount = new Map();
  records.forEach(r => {
    if (!categoryToSources.has(r.category)) categoryToSources.set(r.category, new Set());
    categoryToSources.get(r.category).add(r.source);
    sourceToCount.set(r.source, (sourceToCount.get(r.source) || 0) + 1);
  });

  const root = {
    name: '使用者',
    type: '根節點',
    group: 0,
    children: categories.map(cat => ({
      name: cat,
      type: '來源類型',
      group: 1,
      children: [...(categoryToSources.get(cat) || [])].map(src => ({
        name: src,
        type: '來源細項',
        group: 2,
        count: sourceToCount.get(src) || 1,
      }))
    }))
  };

  return { root, sourceToCount };
}

export default function StressMindMap({ data = demoData, height = 600 }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  const { root: hierarchyData, sourceToCount } = useMemo(() => buildHierarchy(data), [data]);

  useEffect(() => {
    const container = containerRef.current;
    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll('*').remove();

    const width = container?.clientWidth ?? 960;
    const svg = svgEl.attr('width', width).attr('height', height);

    const containerG = svg.append('g');
    const g = containerG.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`);

    const zoom = d3.zoom()
      .scaleExtent([0.5, 2.5])
      .translateExtent([[0, 0], [width, height]])
      .on('zoom', (event) => containerG.attr('transform', event.transform));
    svg.call(zoom);
    svg.on('dblclick.zoom', null);
    svg.on('wheel.zoom', (event) => { if (event.ctrlKey || event.metaKey) event.preventDefault(); });

    // 建立階層與徑向 cluster 佈局
    const root = d3.hierarchy(hierarchyData);
    const computeCluster = (w, h) => {
      const radius = Math.min(w, h) / 2 - 24; // 留白
      const cluster = d3.cluster().size([2 * Math.PI, radius]);
      cluster(root);
    };
    computeCluster(width, height);

    // 來源細項大小依頻率（放大點尺寸）
    const sourceCounts = Array.from(sourceToCount.values());
    const extent = d3.extent(sourceCounts.length ? sourceCounts : [1]);
    const safeDomain = extent[0] === extent[1] ? [0, extent[1] || 1] : extent;
    const radiusScale = d3.scaleLinear().domain(safeDomain).range([12, 26]).clamp(true);
    const getNodeRadius = (d) => {
      if (d.depth === 0) return 16; // 使用者
      if (d.data.type === '來源細項') return radiusScale(d.data.count || 1);
      return 12; // 來源類型
    };

    const color = d3.scaleOrdinal().domain([0, 1, 2]).range(d3.schemeSet2);

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
      .attr('fill', d => color(d.depth))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .style('filter', 'drop-shadow(0 1px 1px rgba(0,0,0,0.15))')
      .style('cursor', 'pointer');

    const labelsSel = g.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(nodesData)
      .join('text')
      .attr('x', d => {
        const p = toXY(d);
        const offset = (p.x >= 0 ? 10 : -10);
        return p.x + offset;
      })
      .attr('y', d => toXY(d).y)
      .attr('text-anchor', d => {
        const p = toXY(d);
        return p.x >= 0 ? 'start' : 'end';
      })
      .style('dominant-baseline', 'middle')
      .style('font-size', '12px')
      .style('fill', '#2b2b2b')
      .style('paint-order', 'stroke')
      .style('stroke', 'white')
      .style('stroke-width', '3px')
      .style('stroke-linejoin', 'round')
      .style('pointer-events', 'none')
      .text(d => d.data.name);

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
      circle.attr('r', getNodeRadius(d) + 2);
      const extra = d.data.type === '來源細項' ? `<div>出現次數：${d.data.count || 1}</div>` : '';
      showTooltip(event, `<strong>${d.data.name}</strong><div>類型：${d.data.type || '節點'}</div>${extra}`);
    }).on('mouseout', (event, d) => {
      d3.select(event.currentTarget).attr('r', getNodeRadius(d));
      hideTooltip();
    });

    const handleResize = () => {
      const newWidth = container?.clientWidth ?? width;
      svg.attr('width', newWidth).attr('height', height);
      // 重新計算 cluster 佈局與更新座標（保留邊距空間讓文字不出框）
      computeCluster(newWidth, height);
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
      zoom.translateExtent([[0, 0], [newWidth, height]]);
    };
    const onResize = () => window.requestAnimationFrame(handleResize);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      tooltip.remove();
    };
  }, [hierarchyData, sourceToCount, height]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 2, display: 'flex', gap: 8 }}>
        {/* 控制列可依需求擴充，如篩選/縮放按鈕 */}
      </div>
      <svg ref={svgRef} />
    </div>
  );
}


