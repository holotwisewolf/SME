// src/components/RatingTest.tsx
import React, { useState, useEffect } from 'react';
import { getGlobalRating, submitPersonalRating, type ItemType } from '../services/rating_services';
import { getSession } from '../services/auth_services'; // 导入获取会话的函数

// 你可以更改 testItemType 的值，使其与你的测试数据匹配
const testItemType: ItemType = 'track'; // 'album', 'playlist'

const RatingTest: React.FC = () => {
  const [globalRating, setGlobalRating] = useState<{ average_rating: number; rating_count: number } | null>(null);
  const [loading, setLoading] = useState(true); // 控制所有异步操作的加载状态
  const [error, setError] = useState<string | null>(null); // 用于显示 fetchGlobalRating 或 handleSubmitRating 发生的错误
  const [currentRatingInput, setCurrentRatingInput] = useState<number>(5); // 默认评分值 5
  const [currentUserId, setCurrentUserId] = useState<string>(''); // 用于存储从会话获取或手动输入的 userId

  // 你可以更改 TEST_ITEM_ID 的值，使其与你的测试数据匹配
  const TEST_ITEM_ID = 'test_track_123';

  // --- 仅在组件首次加载时，尝试获取当前用户的 ID ---
  useEffect(() => {
    const fetchAndSetUserId = async () => {
      try {
        const session = await getSession();
        if (session && session.user) {
          setCurrentUserId(session.user.id);
          console.log("已认证用户ID (从会话获取):", session.user.id);
        } else {
          // 未检测到已认证用户，不设置错误，让用户可以手动输入
          console.warn("未检测到已认证用户。请在下方手动输入测试用户ID，或登录以自动获取。");
        }
      } catch (err) {
        console.error("获取用户会话失败:", err);
        // 如果获取会话失败，也不设置错误，保持输入框为空，用户可以手动输入
      }
    };
    fetchAndSetUserId();
  }, []); // 仅在组件挂载时运行一次，不依赖其他值

  // --- 获取全局评分数据 ---
  const fetchGlobalRating = async () => {
    setLoading(true); // 设置加载状态
    setError(null);    // 清除之前的错误

    try {
      console.log(`正在获取 Item ID: ${TEST_ITEM_ID}, 类型: ${testItemType} 的全局评分...`);
      const result = await getGlobalRating(TEST_ITEM_ID, testItemType);
      setGlobalRating(result);
      console.log('全局评分已获取:', result);
    } catch (err: any) {
      console.error('获取全局评分失败:', err);
      setError(err.message || '获取全局评分失败'); // 捕获并设置错误
    } finally {
      setLoading(false); // 结束加载状态
    }
  };

  // 组件挂载时自动获取一次全局评分
  useEffect(() => {
    fetchGlobalRating();
  }, []); // 仅在组件挂载时运行一次

  // --- 提交个人评分 ---
  const handleSubmitRating = async () => {
    // 客户端验证：确保用户ID不为空
    if (!currentUserId.trim()) {
      alert("请提供一个有效的用户ID以提交评分。");
      return;
    }
    // 客户端验证：确保评分在有效范围内
    if (currentRatingInput < 1 || currentRatingInput > 10) {
      alert("评分值必须在 1 到 10 之间。");
      return;
    }

    setLoading(true); // 设置加载状态
    setError(null);    // 清除之前的错误

    try {
      console.log(`正在提交用户 ${currentUserId} 对 Item ${TEST_ITEM_ID} 的评分 ${currentRatingInput}...`);
      await submitPersonalRating(currentUserId, TEST_ITEM_ID, testItemType, currentRatingInput, true);
      alert(`评分 ${currentRatingInput} 提交成功！`);
      console.log('评分提交成功，正在刷新全局评分...');
      await fetchGlobalRating(); // 提交成功后，重新获取全局评分以更新显示
    } catch (err: any) {
      console.error('提交评分失败:', err);
      setError(err.message || '提交评分失败'); // 捕获并设置错误
    } finally {
      setLoading(false); // 结束加载状态
    }
  };

  return (
    <div className="p-6 bg-[#1a1a1a] rounded-lg shadow-md text-white">
      <h3 className="text-xl font-semibold mb-4 text-[#BAFFB5]">简易评分服务测试</h3>
      
      <p className="text-sm opacity-80 mb-2">测试 Item ID: <strong className="text-[#FFD1D1]">{TEST_ITEM_ID}</strong> (类型: {testItemType})</p>
      
      {/* 这里的loading和error是针对数据获取和提交操作的 */}
      {loading && <p className="text-[#007bff] mb-2">加载中...</p>}
      {error && <p className="text-red-500 mb-2">错误: {error}</p>}

      {/* 显示全局评分数据 */}
      {!loading && !error && (
        <div className="mb-4">
          {globalRating ? (
            <>
              <p>平均评分: <strong className="text-[#FFD1D1]">{globalRating.average_rating?.toFixed(2)}</strong></p>
              <p>评分数量: <strong className="text-[#FFD1D1]">{globalRating.rating_count}</strong></p>
            </>
          ) : (
            <p>未找到该项的全局评分数据。</p>
          )}
        </div>
      )}

      {/* 用户提交评分区域 */}
      <div className="border-t border-gray-700 pt-4 mt-4">
        <h4 className="text-lg font-medium mb-3 text-[#FFD1D1]">提交/更新您的评分 (需要用户ID)</h4>
        
        {/* 用户ID输入框 */}
        <div className="flex items-center gap-3 mb-3">
          <label htmlFor="userIdInput" className="text-sm">用户ID:</label>
          <input
            id="userIdInput"
            type="text"
            value={currentUserId}
            onChange={(e) => setCurrentUserId(e.target.value)}
            placeholder="输入用户UUID (e.g., c2b9a7d3-...)"
            className="flex-grow p-2 rounded border border-gray-600 bg-[#292929] text-white text-sm focus:border-[#007bff] focus:outline-none"
            disabled={loading} // 在加载期间禁用输入框
          />
        </div>

        {/* 评分输入和提交按钮 */}
        <div className="flex items-center gap-3">
          <label htmlFor="ratingInput" className="text-sm">您的评分 (1-10):</label>
          <input
            id="ratingInput"
            type="number"
            min="1"
            max="10"
            value={currentRatingInput}
            onChange={(e) => setCurrentRatingInput(parseInt(e.target.value) || 0)} // 确保解析为数字
            className="w-20 p-2 rounded border border-gray-600 bg-[#292929] text-white text-sm text-center focus:border-[#007bff] focus:outline-none"
            disabled={loading} // 在加载期间禁用输入框
          />
          <button
            onClick={handleSubmitRating}
            // 提交按钮禁用条件：正在加载中，或者用户ID为空
            disabled={loading || !currentUserId.trim()} 
            className={`px-6 py-2 rounded-full text-white font-medium transition ${
              loading || !currentUserId.trim() ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#007bff] hover:bg-[#0056b3] cursor-pointer'
            }`}
          >
            {loading ? '提交中...' : '提交评分'}
          </button>
        </div>
        {/* 用户ID为空时的提示 */}
        {!currentUserId.trim() && <p className="text-orange-400 text-xs mt-2">请提供一个用户ID才能提交评分。</p>}
      </div>
    </div>
  );
};

export default RatingTest;