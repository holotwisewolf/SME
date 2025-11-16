// src/components/Sidebar.tsx
import React from 'react';

const icons = [
  { id: "logo", type: "appIcon", symbol: "🎧" },
  { id: "library", type: "navigation", symbol: "📁" },
  { id: "music", type: "navigation", symbol: "🎵" },
  { id: "community", type: "navigation", symbol: "🌍" },
  { id: "profile", type: "navigation", symbol: "👤" },
  { id: "info", type: "navigation", symbol: "⚙️" }
];

const Sidebar: React.FC = () => {
  return (
    <aside className="w-[60px] bg-[#292929] flex flex-col items-center py-4 space-y-6">
      {icons.map((icon) => (
        <a href="#" key={icon.id} className="text-2xl text-[#D1D1D1] hover:text-[#BAFFB5]">
          {icon.symbol}
        </a>
      ))}
    </aside>
  );
};

export default Sidebar;
