import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar, { SidebarItem } from "./components/Sidebar";
import Header from "./components/Header";
import AnonHomePage from "./pages/anonhomepage"; // Ensure this path matches your file structure

// --- ASSETS ---
// Adjusted paths assuming App.tsx is in 'src/' and assets are in 'src/assets/'
import folderIcon from './assets/folder_icon.png';
import musicIcon from './assets/music_icon.png';
// import logoIcon from './assets/headphones_icon.png'; // Used inside Sidebar component

function App() {
  // State to track the active sidebar item
  const [activeItem, setActiveItem] = useState("Library");

  return (
    <Router>
      <div className="flex bg-[#1E1E1E] min-h-screen text-white font-sans">

        {/* --- LEFT SIDEBAR --- */}
        <Sidebar>
          <SidebarItem
            icon={<img src={folderIcon} className="w-6 h-6 invert opacity-80" alt="Library" />}
            text="Library"
            active={activeItem === "Library"}
            onClick={() => setActiveItem("Library")}
          />
          <SidebarItem
            icon={<img src={musicIcon} className="w-6 h-6 invert opacity-80" alt="Songs" />}
            text="Songs"
            active={activeItem === "Songs"}
            onClick={() => setActiveItem("Songs")}
          />
          <SidebarItem
            icon={<span className="text-xl">❤️</span>}
            text="Favourites"
            active={activeItem === "Favourites"}
            alert // Shows the little notification dot
            onClick={() => setActiveItem("Favourites")}
          />
        </Sidebar>

        {/* --- RIGHT MAIN CONTENT --- */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">

          {/* 1. Header (Search Bar, Profile, etc.) */}
          {/* We wrap it in a div to give it the specific background/border if needed */}
          <div className="shrink-0 z-40">
            <Header />
          </div>

          {/* 2. Scrollable Page Content */}
          <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <Routes>
              {/* If activeItem is "Library", show HomePage, otherwise placeholders */}
              <Route path="/" element={<AnonHomePage />} />
              <Route path="/library" element={<AnonHomePage />} />
              <Route path="/songs" element={<div className="text-2xl p-10">Songs Page Content</div>} />
              <Route path="/favourites" element={<div className="text-2xl p-10">Favourites Page Content</div>} />
            </Routes>
          </main>

        </div>

      </div>
    </Router>
  );
}

export default App;