import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 根據你的路徑
import './MainPageComponents/ClinicMap.css';
import clinicData from './MainPageComponents/clinicMap.json';

// --- 1. 定義圖釘圖示 (Icon) ---
const iconConfig = {
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
};

// 藍色圖釘 (預設)
const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  ...iconConfig
});

// 紅色圖釘 (選取時)
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  ...iconConfig
});

// --- 地圖視角控制元件 ---
function FlyToController({ activeLocation }) {
  const map = useMap();
  useEffect(() => {
    if (activeLocation) {
      map.flyTo([activeLocation.lat, activeLocation.lng], 16, {
        duration: 1.5,
      });

      // Scroll list to active card
      const element = document.getElementById(`clinic-card-${activeLocation.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeLocation, map]);
  return null;
}

const ClinicMap = () => {
  const [clinics] = useState(clinicData);
  const [activeClinic, setActiveClinic] = useState(null);

  // Filters State
  const [selectedCity, setSelectedCity] = useState('全部縣市');
  const [selectedCategory, setSelectedCategory] = useState('全部機構');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsTagDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Extract unique values
  const cities = ['全部縣市', ...new Set(clinics.map(c => c.city).filter(Boolean).sort())];
  const categories = ['全部機構', ...new Set(clinics.map(c => c.category).filter(Boolean).sort())];

  const allTags = React.useMemo(() => {
    const tags = new Set();
    clinics.forEach(c => {
      if (Array.isArray(c.service_tags)) {
        c.service_tags.forEach(t => tags.add(t));
      }
      // Backward compatibility if type still exists and not in tags?
      if (c.type && !c.service_tags?.includes(c.type)) {
        // tags.add(c.type); // Optional: ignore old type field to force migration usage
      }
    });
    return Array.from(tags).sort();
  }, [clinics]);

  // Filtering Logic
  const filteredClinics = clinics.filter(c => {
    const matchCity = selectedCity === '全部縣市' || c.city === selectedCity;
    const matchCategory = selectedCategory === '全部機構' || c.category === selectedCategory;

    // Tag Filter (AND Logic: Match ALL selected tags)
    // If no tags selected, show all.
    const clinicTags = c.service_tags || [];
    const matchTags = selectedTags.length === 0 || selectedTags.every(tag => clinicTags.includes(tag));

    return matchCity && matchCategory && matchTags;
  });

  const handleCardClick = (clinic) => {
    setActiveClinic(clinic);
  };

  const resetFilters = () => {
    setSelectedCity('全部縣市');
    setSelectedCategory('全部機構');
    setSelectedTags([]);
    setActiveClinic(null);
  }

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="map-container">
      {/* 左側列表區 */}
      <div className="sidebar">
        <div className="header">
          <div className="filter-head">
            <h2>全台心理資源地圖 ({filteredClinics.length})</h2>
            <button className="reset-btn" onClick={resetFilters}>重置篩選</button>
          </div>

          <div className="filter-row">
            {/* 縣市篩選 */}
            <div className="filter-group">
              <label className='filter-label'>縣市</label>
              <select
                className="district-select"
                value={selectedCity}
                onChange={(e) => { setSelectedCity(e.target.value); setActiveClinic(null); }}
              >
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* 機構篩選 */}
            <div className="filter-group">
              <label className='filter-label'>機構分類</label>
              <select
                className="district-select"
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setActiveClinic(null); }}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* 服務篩選 (Multi-Select) */}
            <div className="filter-group">
              <label className='filter-label'>服務項目 (複選)</label>
              <div className="multi-select-wrapper" ref={dropdownRef}>
                <div
                  className="multi-select-btn"
                  onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                >
                  {selectedTags.length === 0 ? '全部服務' : `已選 ${selectedTags.length} 項`}
                </div>
                <div className={`multi-select-dropdown ${isTagDropdownOpen ? 'open' : ''}`}>
                  {allTags.map(tag => (
                    <label key={tag} className="multi-select-option">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={() => toggleTag(tag)}
                      />
                      {tag}
                    </label>
                  ))}
                  {allTags.length === 0 && <div style={{ padding: '8px', color: '#999' }}>無服務標籤</div>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="list-container">
          {filteredClinics.map((item) => (
            <div
              key={item.id}
              id={`clinic-card-${item.id}`}
              className={`clinic-card ${activeClinic?.id === item.id ? 'active' : ''}`}
              onClick={() => handleCardClick(item)}
            >
              <div className="card-title">{item.name}</div>
              <div>
                <span className="tag" style={{ background: '#E3F2FD', color: '#1565C0' }}>{item.city}</span>
                <span className="tag" style={{ background: '#F3E5F5', color: '#7B1FA2' }}>{item.category}</span>
                {item.service_tags && item.service_tags.map(tag => (
                  <span key={tag} className="tag" style={{ background: '#fff3e0', color: '#e67e22' }}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className="card-info">📞 {item.phone}</div>
              <div className="card-info">📍 {item.address}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 右側地圖區 */}
      <div className="map-wrapper">
        <MapContainer
          center={[23.97565, 120.9738819]} // Center of Taiwan
          zoom={8}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='© OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FlyToController activeLocation={activeClinic} />

          {filteredClinics.map((item) => {
            const isSelected = activeClinic?.id === item.id;

            return (
              <Marker
                key={item.id}
                position={[item.lat, item.lng]}
                icon={isSelected ? redIcon : blueIcon}
                zIndexOffset={isSelected ? 1000 : 0}
                eventHandlers={{
                  click: () => {
                    setActiveClinic(item);
                  },
                }}
              >
                {/* 這裡是氣泡視窗的內容 */}
                <Popup>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1em', marginBottom: '5px' }}>
                    {item.name}
                  </div>
                  <div style={{ marginBottom: '5px' }}>
                    <span style={{ background: '#E3F2FD', color: '#1565C0', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', marginRight: '5px' }}>{item.city}</span>
                    <span style={{ background: '#F3E5F5', color: '#7B1FA2', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', marginRight: '5px' }}>{item.category}</span>
                    {item.service_tags && item.service_tags.map(tag => (
                      <span key={tag} style={{ background: '#fff3e0', color: '#e67e22', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', marginRight: '5px' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '8px' }}>
                    {item.address}
                  </div>

                  <hr style={{ margin: '8px 0', border: '0', borderTop: '1px solid #eee' }} />

                  {/* Google 導航連結 */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      color: '#3498db',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}
                  >
                    <span style={{ marginRight: '5px' }}>📍</span>
                    開啟 Google 導航
                  </a>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default ClinicMap;