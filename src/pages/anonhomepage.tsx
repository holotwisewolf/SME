// src/pages/HomePage.tsx
import React, { useState } from 'react'; // 确保导入 useState
import PlaylistGrid from '../components/content/PlaylistGrid';
import Clock from '../components/ui/Clock';
import RatingTest from '../components/RatingTest'; // 导入 RatingTest 组件

const HomePage: React.FC = () => {
  const [showRatingTest, setShowRatingTest] = useState(false); // 控制 RatingTest 显示/隐藏的 state

  const toggleRatingTest = () => {
    setShowRatingTest(!showRatingTest);
  };

  return (
    <div className="flex flex-col h-full px-6 relative pb-32">
      {/* Top Row */}
      <div className="flex justify-between items-center mb-8 pt-2 mt-6">
        {/* Left Group: Title + Toggle */}
        <div className="flex items-center gap-6">
          <h1 className="text-4xl font-bold text-[#FFD1D1] tracking-tight leading-none">
            Playlist
          </h1>

          <div className="bg-[#292929] rounded-full p-1 flex items-center h-10">
            <button className="bg-[#1a1a1a] text-white px-5 h-full rounded-full text-sm font-medium flex items-center">
              Name
            </button>
            <button className="text-gray-400 px-5 h-full rounded-full text-sm font-medium hover:text-white flex items-center">
              Name
            </button>
          </div>
        </div>

        <Clock />
      </div>

      <PlaylistGrid />

      {/* Rating Service Test Section */}
      {/* 这个区域的样式，你可以根据你的项目UI自行调整 */}
      <div className="mt-8 mb-8 p-6 bg-[#292929] rounded-xl shadow-lg relative z-40">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-[#BAFFB5]">评分服务测试面板</h2>
          <button
            onClick={toggleRatingTest}
            className="bg-[#1a1a1a] text-white text-sm font-medium rounded-full px-5 py-2 hover:bg-[#252525] transition"
          >
            {showRatingTest ? '隐藏测试' : '显示测试'}
          </button>
        </div>

        {showRatingTest && (
          <div className="mt-4 border-t border-gray-700 pt-4">
            <RatingTest />
          </div>
        )}
      </div>
      {/* End Rating Service Test Section */}

      <div className="absolute bottom-8 right-8 z-50">
        <button className="bg-[#1a1a1a] text-[#BAFFB5] text-sm font-medium rounded-full px-12 py-4 shadow-lg hover:bg-[#252525] transition">
          Add new
        </button>
      </div>
    </div>
  );
};

export default HomePage;