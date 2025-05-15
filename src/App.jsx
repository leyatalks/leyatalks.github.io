import { useState } from "react";
import HomePage from "./HP/HomePage";
import SandPage from "./AP/app-components/Sand";
import LeyaTalks from "./AP/LeyaTalks";

//主要Return
function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const handleNavigation = (path) => {
    if (path === "/LeyaTalks") {
      setCurrentPage("leyaTalks");
    } 
    else {
      setCurrentPage("home");
    }
  };

  return (
    <div>
      {currentPage === "home" ? (
        <HomePage handleNavigation={handleNavigation} />
      )  : (
        <LeyaTalks currentPage={currentPage} setCurrentPage={setCurrentPage} />
      )}
    </div>
  );
}

export default App;