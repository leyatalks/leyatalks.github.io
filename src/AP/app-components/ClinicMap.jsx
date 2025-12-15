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
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
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
    }
  }, [activeLocation, map]);
  return null;
}

const ClinicMap = () => {
  const [clinics] = useState(clinicData); 
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [activeClinic, setActiveClinic] = useState(null);

  const districts = ['all', ...new Set(clinics.map(d => d.district))];

  const filteredClinics = selectedDistrict === 'all' 
    ? clinics 
    : clinics.filter(c => c.district === selectedDistrict);

  const handleCardClick = (clinic) => {
    setActiveClinic(clinic);
  };

  return (
    <div className="map-container">
      {/* 左側列表區 */}
      <div className="sidebar">
        <div className="header">
          <h2>臺北市心理資源地圖 ({filteredClinics.length})</h2>
          <select 
            className="district-select"
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setActiveClinic(null);
            }}
          >
            <option value="all">顯示所有行政區</option>
            {districts.filter(d => d !== 'all').map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="list-container">
          {filteredClinics.map((item) => (
            <div 
              key={item.id}
              className={`clinic-card ${activeClinic?.id === item.id ? 'active' : ''}`}
              onClick={() => handleCardClick(item)}
            >
              <div className="card-title">{item.name}</div>
              <div>
                <span className="tag">{item.district}</span>
                <span className="tag" style={{background: '#fff3e0', color: '#e67e22'}}>
                  {item.type}
                </span>
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
          center={[25.032969, 121.565418]} 
          zoom={13} 
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
                    <span style={{ 
                      background: '#fff3e0', 
                      color: '#e67e22', 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      fontSize: '0.8rem' 
                    }}>
                      {item.type}
                    </span>
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