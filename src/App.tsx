import React, { useState } from 'react';
import CalendarSVG from './components/CalendarSVG';
import { getLunarInfo } from './utils/lunar';
import { DailyContent } from './types';

// 硬编码备用内容，供 P0 阶段验证使用
const fallbackContent: DailyContent = {
  activity: '读书',
  quote: '学而不思则罔，思而不学则殆。',
  author: '孔子',
  source: '论语·为政',
};

const App: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());

  // 处理日期变更
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setDate(newDate);
    }
  };

  const lunar = getLunarInfo(date);

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center py-12 px-4">
      {/* 控制面板 */}
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl mb-12 flex flex-col gap-4 border border-stone-200">
        <h1 className="text-xl font-bold text-gray-800 text-center tracking-widest uppercase">灵感日历 · Inspiration Calendar</h1>
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
      </div>

      {/* 日历展示区域 */}
      <div className="w-full max-w-lg relative perspective-1000">
        <div className="transition-all duration-700 ease-in-out hover:scale-[1.02]">
          <CalendarSVG date={date} lunar={lunar} content={fallbackContent} />
        </div>
      </div>

      {/* 页脚信息 */}
      <footer className="mt-16 text-stone-400 text-xs text-center max-w-sm tracking-wider">
        <p>© 2025 INSPIRATION CALENDAR</p>
      </footer>
    </div>
  );
};

export default App;