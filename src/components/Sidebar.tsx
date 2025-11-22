import React, { useState } from 'react';

// --- IMPORTS ---
// Make sure these files exist in 'src/assets/'
import logoIcon from '../assets/headphones_icon3.png'; 
import folderIcon from '../assets/folder_icon3.png';
import musicIcon from '../assets/music_icon.png';
import infoIcon from '../assets/info_icon.png';

const icons = [
  { id: "library", type: "navigation", src: folderIcon, alt: "Library" },
  { id: "music", type: "navigation", src: musicIcon, alt: "Music" },
  { id: "info", type: "navigation", src: infoIcon, alt: "Info" }
];  

const Sidebar: React.FC = () => {
  // State to track which tab is clicked (active)
  const [activeTab, setActiveTab] = useState('library');
  // State to track which tab is currently being hovered
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  return (
    <aside className="w-[70px] bg-[var(--color-background-primary)] flex flex-col border-r border-white h-screen">
      
      {/* 1. TOP SECTION (LOGO) */}
      <div className="h-20 w-full flex items-center justify-center border-b border-white">
        <div className="bg-[#FFD1D1] p-3 rounded-2xl">
          <img 
            src={logoIcon} 
            alt="App Logo" 
            className="w-8 h-8 object-contain"
          />
        </div>
      </div>

      {/* 2. NAVIGATION SECTION */}
      <div className="flex-1 flex flex-col items-center pt-10 pb-4 space-y-8">
        {icons.map((icon) => {
          
          const isActive = activeTab === icon.id;
          const isHovered = hoveredTab === icon.id;

          // HOVER LOGIC:
          // 1. If hovering an item (isHovered): Highlight IT.
          // 2. If hovering NOTHING (hoveredTab === null) AND this is the active item: Highlight IT.
          // 3. If hovering SOMETHING ELSE: The active item loses highlight.
          const shouldHighlight = isHovered || (isActive && hoveredTab === null);
          
          return (
            <div 
              key={icon.id} 
              className="relative group cursor-pointer flex items-center justify-center"
              // Add Mouse Events to track hover state
              onMouseEnter={() => setHoveredTab(icon.id)}
              onMouseLeave={() => setHoveredTab(null)}
              onClick={() => setActiveTab(icon.id)}
            >
              
              {/* HIGHLIGHT BACKGROUND (Dark Square) */}
              {shouldHighlight && (
                <div className="absolute -inset-2 bg-[#D1F3FF]/20 rounded-xl pointer-events-none z-0"></div>
              )}
              
              {/* ICON IMAGE */}
              <div className="relative z-10">
                  <img 
                    src={icon.src} 
                    alt={icon.alt} 
                    // FIXED: Changed 'isSelected' to 'shouldHighlight'
                    // This ensures the icon brightens up when the background box appears
                    className={`w-10 h-10 object-contain transition-opacity ${shouldHighlight ? 'opacity-100' : 'opacity-90'}`}
                  />
              </div>

            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;