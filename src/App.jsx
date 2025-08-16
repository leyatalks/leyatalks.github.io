import { useState, useEffect } from "react";
import HomePage from "./HP/HomePage";
import SandPage from "./AP/app-components/Sand";
import LeyaTalks from "./AP/LeyaTalks";

//主要Return
function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    try {
      const saved = localStorage.getItem("currentPage");
      return saved || "home";
    } catch (err) {
      return "home";
    }
  });

  const handleNavigation = (path) => {
    if (path === "/LeyaTalks") {
      setCurrentPage("leyaTalks");
    }
    else {
      setCurrentPage("home");
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem("currentPage", currentPage);
    } catch (err) {
      // 忽略持久化錯誤
    }
  }, [currentPage]);

  return (
    <div style={{
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden',
      position: 'relative',
      boxSizing: 'border-box',
      touchAction: 'pan-y' // 只允許垂直滑動，禁止水平滑動
    }}>
      {currentPage === "home" ? (
        <HomePage handleNavigation={handleNavigation} />
      )  : (
        <LeyaTalks currentPage={currentPage} setCurrentPage={setCurrentPage} />
      )}
    </div>
  );
}

export default App;