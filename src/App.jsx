import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from "./HP/HomePage";
import LeyaTalks from "./AP/LeyaTalks";

function App() {
  return (
    <div style={{
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden',
      position: 'relative',
      boxSizing: 'border-box',
      touchAction: 'pan-y'
    }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/leya/*" element={<LeyaTalks />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;