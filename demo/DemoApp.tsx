import React, { useCallback, useMemo, useState } from 'react';
import { Calendar, type CalendarContent } from '../src';
import { formatLocalDate, parseLocalDate } from '../src/utils/dateUtils';
import { fetchHitokoto } from './data/hitokoto';
import localData from './data/custom.json';

type DataMode =
  | 'static'
  | 'local-json'
  | 'hitokoto'
  | 'mock-slow-success'
  | 'mock-error'
  | 'mock-race'
  | 'mixed-content-fetch';

type RequestPhase = 'start' | 'resolve' | 'reject';

interface RequestLogEntry {
  id: number;
  mode: DataMode;
  date: string;
  phase: RequestPhase;
  note: string;
}

const staticContent: CalendarContent = {
  activity: '读书',
  quote: '学而不思则罔，思而不学则殆。',
  author: '孔子',
  source: '论语·为政',
};

const contractProbeContent: CalendarContent[] = [
  {
    date: '2099-01-01',
    activity: '未来',
    quote: '这条内容故意不匹配当前测试日期，用来验证 content 已传入时是否仍会错误触发 fetchContent。',
    author: 'Demo',
    source: 'Contract Probe',
  },
];

const slowRaceDate = '2026-03-26';
const fastRaceDate = '2026-03-27';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const toSafeDate = (dateStr: string) => parseLocalDate(dateStr) ?? new Date();

const baseModeButtons: Array<[DataMode, string, string]> = [
  ['static', '单条静态', 'bg-blue-100 text-blue-800'],
  ['local-json', '本地 JSON', 'bg-blue-100 text-blue-800'],
  ['hitokoto', '真实 API', 'bg-blue-100 text-blue-800'],
  ['mixed-content-fetch', '混合优先级', 'bg-purple-100 text-purple-800'],
];

const asyncModeButtons: Array<[DataMode, string, string]> = [
  ['mock-slow-success', '1.5s 加载态', 'bg-orange-100 text-orange-800'],
  ['mock-error', '接口报错兜底', 'bg-red-100 text-red-800'],
  ['mock-race', '快速切日期竞态', 'bg-teal-100 text-teal-800'],
];

const modeTips: Record<DataMode, string> = {
  static: '固定展示单条内容，切换日期时内容不应变化。',
  'local-json': '优先按 date 精确匹配；没命中时继续看无 date 项；再没有才回退默认内容。',
  hitokoto: '适合看真实接口接入，不适合稳定复现错误态和竞态。',
  'mock-slow-success': '应先看到骨架加载，再在约 1.5 秒后显示 mock 内容。',
  'mock-error': '应先看到骨架加载，随后失败并回退到默认备用内容。',
  'mock-race': `先点 ${slowRaceDate}，再立刻点 ${fastRaceDate}。最终页面应展示 ${fastRaceDate} 对应结果。`,
  'mixed-content-fetch':
    '这里故意传入不会命中当前日期的 content 数组，同时也传 fetchContent。若请求计数大于 0，说明优先级契约仍有问题。',
};

const DemoApp: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [dataMode, setDataMode] = useState<DataMode>('static');
  const [requestLogs, setRequestLogs] = useState<RequestLogEntry[]>([]);
  const [visible, setVisible] = useState<boolean>(true);

  const appendLog = useCallback((mode: DataMode, dateValue: Date, phase: RequestPhase, note: string) => {
    setRequestLogs((prev) => [
      {
        id: prev.length + 1,
        mode,
        date: formatLocalDate(dateValue),
        phase,
        note,
      },
      ...prev,
    ]);
  }, []);

  const mockFetchers = useMemo(() => {
    return {
      slowSuccess: async (requestDate: Date): Promise<CalendarContent> => {
        appendLog('mock-slow-success', requestDate, 'start', 'request sent');
        await sleep(1500);
        appendLog('mock-slow-success', requestDate, 'resolve', 'resolved after 1500ms');
        return {
          activity: '验证成功',
          quote: `这是一条固定的慢请求 mock 数据，请求日期为 ${formatLocalDate(requestDate)}。`,
          author: 'Mock System',
          source: 'Slow Success',
        };
      },
      error: async (requestDate: Date): Promise<CalendarContent> => {
        appendLog('mock-error', requestDate, 'start', 'request sent');
        await sleep(1500);
        appendLog('mock-error', requestDate, 'reject', 'rejected after 1500ms');
        throw new Error('mock 500');
      },
      race: async (requestDate: Date): Promise<CalendarContent> => {
        const requestDateKey = formatLocalDate(requestDate);
        const delay = requestDateKey === slowRaceDate ? 2500 : 200;
        appendLog('mock-race', requestDate, 'start', `request sent, delay ${delay}ms`);
        await sleep(delay);
        appendLog('mock-race', requestDate, 'resolve', `resolved after ${delay}ms`);
        return {
          activity: '竞态测试',
          quote: `当前返回的是 ${requestDateKey} 的 mock 数据。若你最终看到的不是最后一次选择的日期，说明竞态处理有问题。`,
          author: 'Mock System',
          source: `Race ${delay}ms`,
        };
      },
      mixedPriority: async (requestDate: Date): Promise<CalendarContent> => {
        appendLog('mixed-content-fetch', requestDate, 'start', 'fetchContent should not run in this mode');
        await sleep(300);
        appendLog('mixed-content-fetch', requestDate, 'resolve', 'unexpected resolve');
        return {
          activity: '不应出现',
          quote: '如果你看到了这条内容，说明 content 和 fetchContent 的优先级实现有偏差。',
          author: 'Demo',
          source: 'Priority Probe',
        };
      },
    };
  }, [appendLog]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(toSafeDate(e.target.value));
  };

  const handleModeChange = (mode: DataMode) => {
    setRequestLogs([]);
    setDataMode(mode);
  };

  const calendarProps = useMemo(() => {
    switch (dataMode) {
      case 'static':
        return { content: staticContent };
      case 'local-json':
        return { content: localData as CalendarContent[] };
      case 'hitokoto':
        return { fetchContent: fetchHitokoto };
      case 'mock-slow-success':
        return { fetchContent: mockFetchers.slowSuccess };
      case 'mock-error':
        return { fetchContent: mockFetchers.error };
      case 'mock-race':
        return { fetchContent: mockFetchers.race };
      case 'mixed-content-fetch':
        return {
          content: contractProbeContent,
          fetchContent: mockFetchers.mixedPriority,
        };
    }
  }, [dataMode, mockFetchers]);

  const visibleLogs = requestLogs.filter((entry) => entry.mode === dataMode);
  const requestCount = visibleLogs.filter((entry) => entry.phase === 'start').length;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center py-12 px-4">
      {/* 顶部：仅保留标题和日期 */}
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl mb-12 flex flex-col gap-4 border border-stone-200">
        <h1 className="text-xl font-bold text-gray-800 text-center tracking-widest uppercase">
          灵感日历 · Inspiration Calendar
        </h1>

        <div className="flex items-center gap-4">
          <label htmlFor="date" className="text-sm font-medium text-gray-600 shrink-0">
            当前首选日期
          </label>
          <input
            id="date"
            type="date"
            value={formatLocalDate(date)}
            onChange={handleDateChange}
            className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all bg-stone-50"
          />
        </div>
      </div>

      {/* 主体区域：利用三栏 Flex 布局实现完美绝对居中 */}
      <div className="w-full flex flex-col xl:flex-row items-start px-4 lg:px-12">
        {/* 第一栏 / 左侧：测试面板靠左 */}
        <div className="w-full xl:flex-1 flex justify-start mb-16 xl:mb-0">
          <div className="w-full max-w-[420px] shrink-0 bg-white p-6 rounded-2xl shadow-lg border border-stone-200 flex flex-col gap-6">
          <h2 className="text-base font-bold text-gray-800 uppercase tracking-widest border-b border-stone-100 pb-3">
            功能调试面板
          </h2>

          {/* 显隐控制开关 */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-gray-600 shrink-0">可见状态 (visible)</span>
            <button
              type="button"
              onClick={() => setVisible((prev) => !prev)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                visible
                  ? 'bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-800'
                  : 'bg-stone-200 text-stone-600 hover:bg-stone-300 focus:ring-stone-400'
              }`}
            >
              {visible ? '点击隐藏 (false)' : '点击显示 (true)'}
            </button>
          </div>

          {/* 竞态快捷触发器 */}
          {dataMode === 'mock-race' && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-gray-600 shrink-0">竞态日期快捷键</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDate(toSafeDate(slowRaceDate))}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-teal-100 text-teal-800 hover:brightness-95 transition-all"
                >
                  慢 {slowRaceDate.slice(5)}
                </button>
                <button
                  type="button"
                  onClick={() => setDate(toSafeDate(fastRaceDate))}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-teal-100 text-teal-800 hover:brightness-95 transition-all"
                >
                  快 {fastRaceDate.slice(5)}
                </button>
              </div>
            </div>
          )}

          {/* 数据源切换 */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-600 shrink-0">基础及逻辑测试</span>
              <div className="flex gap-2 flex-wrap">
                {baseModeButtons.map(([mode, label, colorClass]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleModeChange(mode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      dataMode === mode
                        ? 'bg-gray-800 text-white shadow-sm ring-2 ring-gray-900 ring-offset-1'
                        : `${colorClass} hover:brightness-95`
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-600 shrink-0">异步状态及网络测试</span>
              <div className="flex gap-2 flex-wrap">
                {asyncModeButtons.map(([mode, label, colorClass]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleModeChange(mode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      dataMode === mode
                        ? 'bg-gray-800 text-white shadow-sm ring-2 ring-gray-900 ring-offset-1'
                        : `${colorClass} hover:brightness-95`
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 调试日志终端 */}
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 flex flex-col gap-3 mt-2">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-stone-800">关于此模式</p>
                <p className="text-xs text-stone-600 mt-1">{modeTips[dataMode]}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-200">
              <div className="flex gap-2 text-[10px] text-stone-500 font-medium font-mono uppercase">
                <span className="bg-stone-200 px-2 py-0.5 rounded">Requests: {requestCount}</span>
                <span className="bg-stone-200 px-2 py-0.5 rounded">Logs: {visibleLogs.length}</span>
              </div>
              <button
                type="button"
                onClick={() => setRequestLogs([])}
                className="px-2 py-1 rounded text-[10px] uppercase font-bold bg-stone-200 text-stone-600 hover:bg-stone-300 transition-colors"
              >
                Clear
              </button>
            </div>

            <div className="rounded-lg bg-gray-900 text-stone-300 p-3 text-xs font-mono max-h-48 overflow-y-auto leading-relaxed shadow-inner">
              {visibleLogs.length === 0 ? (
                <p className="opacity-50 text-center italic mt-2">No request logs</p>
              ) : (
                visibleLogs.map((entry) => (
                  <div key={entry.id} className="mb-1.5 border-b border-gray-800 pb-1.5 last:border-0 last:pb-0">
                    <span className={`font-bold mr-1 ${entry.phase === 'reject' ? 'text-red-400' : 'text-blue-300'}`}>
                      [{entry.phase}]
                    </span>
                    <span className="text-gray-500 text-[10px] mr-2">{entry.date.slice(5)}</span>
                    <span className="text-gray-100">{entry.note}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 第二栏 / 中间：日历组件绝对居中预览 */}
        <div className="w-full xl:w-auto shrink-0 relative perspective-1000 flex justify-center z-10">
          <div className="w-full max-w-md sm:w-[480px] transition-all duration-700 ease-in-out hover:scale-[1.02] transform-gpu">
            <Calendar date={date} visible={visible} {...calendarProps} />
          </div>
        </div>

        {/* 第三栏 / 右侧：纯粹的空占位，用来与左侧平衡，保证日历严格在屏幕正中央 */}
        <div className="hidden xl:block xl:flex-1"></div>
      </div>

      <footer className="mt-16 text-stone-400 text-xs text-center max-w-sm tracking-wider">
        <p>© 2025 INSPIRATION CALENDAR</p>
      </footer>
    </div>
  );
};

export default DemoApp;
