import React, { useState, useEffect, useCallback } from 'react';
import CalendarSVG from './components/CalendarSVG';
import { fetchDailyInspiration } from './services/geminiService';
import { getLunarInfo } from './utils/lunar';
import { DailyContent } from './types';

const App: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [content, setContent] = useState<DailyContent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 加载灵感数据
  const loadData = useCallback(async (selectedDate: Date) => {
    setLoading(true);
    try {
      const data = await fetchDailyInspiration(selectedDate);
      setContent(data);
    } catch (err) {
      console.error("加载灵感失败", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 处理日期变更
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setDate(newDate);
      loadData(newDate);
    }
  };

  const lunar = getLunarInfo(date);

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center py-12 px-4">
      {/* 控制面板 */}
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl mb-12 flex flex-col gap-4 border border-stone-200">
        <h1 className="text-xl font-bold text-gray-800 text-center tracking-widest uppercase">源境日历 · YUANJING</h1>
        <div className="flex items-center gap-4">
          <label htmlFor="date" className="text-sm font-medium text-gray-600 shrink-0">日期</label>
          <input 
            id="date"
            type="date" 
            value={date.toISOString().split('T')[0]} 
            onChange={handleDateChange}
            className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all bg-stone-50"
          />
        </div>
        <button 
          onClick={() => loadData(date)}
          className="bg-black text-white py-2.5 rounded-xl font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 active:scale-95 transform"
          disabled={loading}
        >
          {loading ? '撷取中...' : '重新获取灵感'}
        </button>
      </div>

      {/* 日历展示区域 */}
      <div className="w-full max-w-lg relative perspective-1000">
        {loading && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-md z-10 flex items-center justify-center rounded-2xl">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium tracking-widest text-black">灵感降临中...</p>
            </div>
          </div>
        )}
        
        {content && (
          <div className="transition-all duration-700 ease-in-out hover:scale-[1.02]">
            <CalendarSVG date={date} lunar={lunar} content={content} />
          </div>
        )}
      </div>

      {/* 页脚信息 */}
      <footer className="mt-16 text-stone-400 text-xs text-center max-w-sm tracking-wider">
        <p>POWERED BY GEMINI 3 FLASH</p>
        <p className="mt-1">© 2025 YUANJING CALENDAR</p>
      </footer>
    </div>
  );
};

export default App;