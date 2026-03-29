import React, { useCallback, useMemo, useState } from 'react';
import { Calendar, getLunarInfo, type CalendarContent } from '../src';
import { formatLocalDate, parseLocalDate } from '../src/utils/dateUtils';
import { fetchHitokoto } from './data/hitokoto';
import localData from './data/custom.json';
import styles from './DemoApp.module.css';

type DataMode =
  | 'static'
  | 'local-json'
  | 'hitokoto'
  | 'mock-slow-success'
  | 'mock-error'
  | 'mock-race'
  | 'mixed-content-fetch';

type ThemeName = 'classic' | 'dark' | 'minimalist';
type RequestPhase = 'start' | 'resolve' | 'reject';
type SideTab = 'debug' | 'lunar';

interface RequestLogEntry {
  id: number;
  mode: DataMode;
  date: string;
  phase: RequestPhase;
  note: string;
}

interface LunarValidationCase {
  date: string;
  label: string;
  expected: {
    monthInWords: string;
    weekday: string;
    lunarMonth: string;
    lunarDay: string;
  };
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
    quote:
      '这条内容故意不匹配当前测试日期，用来验证 content 已传入时是否仍会错误触发 fetchContent。',
    author: 'Demo',
    source: 'Contract Probe',
  },
];

const lunarValidationCases: LunarValidationCase[] = [
  {
    date: '2024-02-09',
    label: '春节前一天',
    expected: {
      monthInWords: '二月',
      weekday: '星期五',
      lunarMonth: '腊月',
      lunarDay: '三十',
    },
  },
  {
    date: '2024-02-10',
    label: '春节',
    expected: {
      monthInWords: '二月',
      weekday: '星期六',
      lunarMonth: '正月',
      lunarDay: '初一',
    },
  },
  {
    date: '2024-09-17',
    label: '中秋',
    expected: {
      monthInWords: '九月',
      weekday: '星期二',
      lunarMonth: '八月',
      lunarDay: '十五',
    },
  },
  {
    date: '2020-05-23',
    label: '闰四月初一',
    expected: {
      monthInWords: '五月',
      weekday: '星期六',
      lunarMonth: '闰四月',
      lunarDay: '初一',
    },
  },
  {
    date: '2024-12-31',
    label: '年末边界',
    expected: {
      monthInWords: '十二月',
      weekday: '星期二',
      lunarMonth: '腊月',
      lunarDay: '初一',
    },
  },
];

const slowRaceDate = '2026-03-26';
const fastRaceDate = '2026-03-27';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const toSafeDate = (dateStr: string) => parseLocalDate(dateStr) ?? new Date();

const shiftDate = (value: Date, offset: number) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate() + offset);

const baseModeButtons: Array<[DataMode, string, string]> = [
  ['static', '单条静态', styles.btnBlue],
  ['local-json', '本地 JSON', styles.btnBlue],
  ['hitokoto', '真实 API', styles.btnBlue],
  ['mixed-content-fetch', '混合优先级', styles.btnPurple],
];

const asyncModeButtons: Array<[DataMode, string, string]> = [
  ['mock-slow-success', '1.5s 加载态', styles.btnOrange],
  ['mock-error', '接口报错兜底', styles.btnRed],
  ['mock-race', '快速切日期竞态', styles.btnTeal],
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

const sideTabs: Array<[SideTab, string]> = [
  ['debug', '功能调试'],
  ['lunar', '农历校验'],
];

const themeButtons: Array<[ThemeName, string]> = [
  ['classic', '经典'],
  ['dark', '暗黑'],
  ['minimalist', '极简'],
];

const DemoApp: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [dataMode, setDataMode] = useState<DataMode>('static');
  const [requestLogs, setRequestLogs] = useState<RequestLogEntry[]>([]);
  const [visible, setVisible] = useState<boolean>(true);
  const [sideTab, setSideTab] = useState<SideTab>('debug');
  const [theme, setTheme] = useState<ThemeName>('classic');

  const appendLog = useCallback(
    (mode: DataMode, dateValue: Date, phase: RequestPhase, note: string) => {
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
    },
    [],
  );

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
        appendLog(
          'mixed-content-fetch',
          requestDate,
          'start',
          'fetchContent should not run in this mode',
        );
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
  const selectedDateKey = formatLocalDate(date);
  const lunarInfo = useMemo(() => getLunarInfo(date), [date]);
  const matchedLunarCase = useMemo(
    () => lunarValidationCases.find((item) => item.date === selectedDateKey) ?? null,
    [selectedDateKey],
  );
  const lunarValidationPassed = matchedLunarCase
    ? Object.entries(matchedLunarCase.expected).every(
        ([key, value]) => lunarInfo[key as keyof typeof matchedLunarCase.expected] === value,
      )
    : null;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerCard}>
        <h1 className={styles.title}>灵感日历 · Inspiration Calendar</h1>

        <div className={styles.inputGroup}>
          <label htmlFor="date" className={styles.label}>
            当前首选日期
          </label>
          <input
            id="date"
            type="date"
            value={selectedDateKey}
            onChange={handleDateChange}
            className={styles.dateInput}
          />
        </div>
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.controlPanelWrap}>
          <div className={styles.controlPanel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>控制面板</h2>
              <div className={styles.tabGroup}>
                {sideTabs.map(([tab, label]) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setSideTab(tab)}
                    className={`${styles.tabButton} ${sideTab === tab ? styles.tabButtonActive : ''}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.panelBody}>
              {sideTab === 'debug' ? (
                <>
                  <div className={styles.sectionRow}>
                    <span className={styles.sectionTitle}>主题切换 (theme)</span>
                    <div className={styles.buttonRow}>
                      {themeButtons.map(([t, label]) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTheme(t)}
                          className={`${styles.btnBase} ${theme === t ? styles.btnActive : styles.btnLight}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.sectionRow}>
                    <span className={styles.sectionTitle}>可见状态 (visible)</span>
                    <button
                      type="button"
                      onClick={() => setVisible((prev) => !prev)}
                      className={`${styles.btnBase} ${visible ? styles.btnDark : styles.btnLight}`}
                    >
                      {visible ? '点击隐藏 (false)' : '点击显示 (true)'}
                    </button>
                  </div>

                  {dataMode === 'mock-race' && (
                    <div className={styles.sectionRow}>
                      <span className={styles.sectionTitle}>竞态日期快捷键</span>
                      <div className={styles.buttonRow}>
                        <button
                          type="button"
                          onClick={() => setDate(toSafeDate(slowRaceDate))}
                          className={`${styles.btnBase} ${styles.btnTeal}`}
                        >
                          慢 {slowRaceDate.slice(5)}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDate(toSafeDate(fastRaceDate))}
                          className={`${styles.btnBase} ${styles.btnTeal}`}
                        >
                          快 {fastRaceDate.slice(5)}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className={styles.sectionRow}>
                    <span className={styles.sectionTitle}>基础及逻辑测试</span>
                    <div className={styles.buttonRow}>
                      {baseModeButtons.map(([mode, label, colorClass]) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => handleModeChange(mode)}
                          className={`${styles.btnBase} ${dataMode === mode ? styles.btnActive : colorClass}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.sectionRow}>
                    <span className={styles.sectionTitle}>异步状态及网络测试</span>
                    <div className={styles.buttonRow}>
                      {asyncModeButtons.map(([mode, label, colorClass]) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => handleModeChange(mode)}
                          className={`${styles.btnBase} ${dataMode === mode ? styles.btnActive : colorClass}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.infoCard}>
                    <div>
                      <h3 className={styles.infoTitle}>关于此模式</h3>
                      <p className={styles.sectionDesc}>{modeTips[dataMode]}</p>
                    </div>

                    <div className={styles.logTools}>
                      <div className={styles.badges}>
                        <span className={styles.badge}>Requests: {requestCount}</span>
                        <span className={styles.badge}>Logs: {visibleLogs.length}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRequestLogs([])}
                        className={styles.btnTiny}
                      >
                        Clear
                      </button>
                    </div>

                    <div className={styles.logContainer}>
                      {visibleLogs.length === 0 ? (
                        <p
                          style={{
                            opacity: 0.5,
                            textAlign: 'center',
                            fontStyle: 'italic',
                            marginTop: '0.5rem',
                          }}
                        >
                          No request logs
                        </p>
                      ) : (
                        visibleLogs.map((entry) => (
                          <div key={entry.id} className={styles.logEntry}>
                            <span
                              className={
                                entry.phase === 'reject' ? styles.logTagError : styles.logTagSuccess
                              }
                            >
                              [{entry.phase}]
                            </span>
                            <span className={styles.logDate}>{entry.date.slice(5)}</span>
                            <span>{entry.note}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.sectionRow}>
                    <div>
                      <h3 className={styles.sectionTitle}>关键日期对照</h3>
                      <p className={styles.sectionDesc}>
                        通过春节、闰月和跨年样例快速验证农历结果。
                      </p>
                    </div>
                    <div className={styles.buttonRow}>
                      <button
                        type="button"
                        onClick={() => setDate((prev) => shiftDate(prev, -1))}
                        className={`${styles.btnBase} ${styles.btnLight}`}
                      >
                        前一天
                      </button>
                      <button
                        type="button"
                        onClick={() => setDate((prev) => shiftDate(prev, 1))}
                        className={`${styles.btnBase} ${styles.btnLight}`}
                      >
                        后一天
                      </button>
                    </div>
                  </div>

                  <div className={styles.buttonRow}>
                    {lunarValidationCases.map((item) => (
                      <button
                        key={item.date}
                        type="button"
                        onClick={() => setDate(toSafeDate(item.date))}
                        className={`${styles.btnBase} ${selectedDateKey === item.date ? styles.btnActive : styles.btnEmerald}`}
                      >
                        {item.label} {item.date.slice(5)}
                      </button>
                    ))}
                  </div>

                  <div className={styles.infoCard}>
                    <h3 className={styles.infoTitle}>当前计算结果</h3>
                    <div className={styles.vRow}>
                      <span className={styles.vLabel}>日期</span>
                      <span className={styles.vValueMono}>{selectedDateKey}</span>
                    </div>
                    <div className={styles.vRow}>
                      <span className={styles.vLabel}>公历月份</span>
                      <span className={styles.vValue}>{lunarInfo.monthInWords}</span>
                    </div>
                    <div className={styles.vRow}>
                      <span className={styles.vLabel}>星期</span>
                      <span className={styles.vValue}>{lunarInfo.weekday}</span>
                    </div>
                    <div className={styles.vRow}>
                      <span className={styles.vLabel}>农历月份</span>
                      <span className={styles.vValue}>{lunarInfo.lunarMonth}</span>
                    </div>
                    <div className={styles.vRow}>
                      <span className={styles.vLabel}>农历日期</span>
                      <span className={styles.vValue}>{lunarInfo.lunarDay}</span>
                    </div>
                  </div>

                  <div className={styles.validationCard}>
                    <h3 className={styles.infoTitle}>对照校验</h3>
                    {matchedLunarCase ? (
                      <>
                        <div className={styles.vRow}>
                          <span className={styles.vLabel}>命中样例</span>
                          <span className={styles.vValue}>
                            {matchedLunarCase.label} ({matchedLunarCase.date})
                          </span>
                        </div>
                        <div className={styles.vRow}>
                          <span className={styles.vLabel}>预期值</span>
                          <span className={styles.vValue} style={{ textAlign: 'right' }}>
                            {matchedLunarCase.expected.lunarMonth}
                            {matchedLunarCase.expected.lunarDay} /{' '}
                            {matchedLunarCase.expected.weekday}
                          </span>
                        </div>
                        <div className={styles.vRow}>
                          <span className={styles.vLabel}>校验结果</span>
                          <span className={lunarValidationPassed ? styles.vPassed : styles.vFailed}>
                            {lunarValidationPassed ? '通过' : '不通过'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className={styles.sectionDesc}>
                        当前日期没有预置对照样例。点击上方关键日期按钮，可以验证春节、闰月和跨年边界。
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={styles.previewWrap}>
          <div className={styles.previewScaler}>
            <Calendar
              date={date}
              visible={visible}
              theme={theme}
              className={styles.calendarOverride}
              {...calendarProps}
            />
          </div>
        </div>

        <div className={styles.rightSpacer}></div>
      </div>

      <footer className={styles.footer}>
        <p>© 2025 INSPIRATION CALENDAR</p>
      </footer>
    </div>
  );
};

export default DemoApp;
