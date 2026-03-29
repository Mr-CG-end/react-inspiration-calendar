import React from 'react';
import { ThemeComponentProps } from '../../types';
import styles from '../../styles/classic.module.css';

const ClassicCalendar: React.FC<ThemeComponentProps> = ({ date, lunar, content, loading }) => {
  const day = date.getDate().toString();

  return (
    <svg viewBox="0 0 600 900" className={styles.calendar} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <path id="topArc" d="M -45,0 A 45,45 0 0,1 45,0" />
        <path id="bottomArc" d="M -45,0 A 45,45 0 0,0 45,0" />
      </defs>

      {/* 边框：圆角较小，外边距较大 */}
      <rect
        x="50"
        y="50"
        width="500"
        height="800"
        fill="none"
        stroke="black"
        strokeWidth="2"
        rx="4"
        ry="4"
      />

      {/* 页眉横线 */}
      <line x1="70" y1="130" x2="530" y2="130" stroke="black" strokeWidth="1" />

      {/* 顶部信息区域 */}
      <text
        x="70"
        y="105"
        fontSize="24"
        fontFamily="'Noto Serif SC', 'Songti SC', serif"
        fontWeight="700"
      >
        {lunar.monthInWords}
      </text>
      <text
        x="300"
        y="105"
        fontSize="16"
        textAnchor="middle"
        fontFamily="'Noto Serif SC', 'Songti SC', serif"
      >
        农历{lunar.lunarMonth}
        {lunar.lunarDay}
      </text>
      <text
        x="530"
        y="105"
        fontSize="24"
        textAnchor="end"
        fontFamily="'Noto Serif SC', 'Songti SC', serif"
        fontWeight="700"
      >
        {lunar.weekday}
      </text>

      {/* 主日期数字 */}
      <text
        x="300"
        y="450"
        fontSize="320"
        textAnchor="middle"
        fontFamily="'Noto Serif SC', 'Songti SC', serif"
        fontWeight="900"
        style={{ letterSpacing: '-10px' }}
      >
        {day}
      </text>

      {/* 品牌标识区域（静态不动） */}
      <g transform="translate(480, 570)">
        <text
          x="0"
          y="6"
          fontSize="14"
          textAnchor="middle"
          fontFamily="'Noto Serif SC', 'Songti SC', serif"
          fontWeight="900"
        >
          灵感日历
        </text>
        <text fontSize="7" fontWeight="bold">
          <textPath
            href="#bottomArc"
            startOffset="50%"
            textAnchor="middle"
            dominantBaseline="hanging"
          >
            2025 INSPIRATION CALENDAR
          </textPath>
        </text>
      </g>

      {/* 分隔横线（静态不动） */}
      <line x1="70" y1="650" x2="530" y2="650" stroke="black" strokeWidth="1" />

      {loading ? (
        <g opacity="0.4">
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
          <rect x="220" y="550" width="160" height="48" rx="8" fill="#e5e7eb" />
          <rect x="70" y="690" width="460" height="24" rx="4" fill="#f3f4f6" />
          <rect x="70" y="730" width="380" height="24" rx="4" fill="#f3f4f6" />
          <rect x="70" y="815" width="140" height="18" rx="4" fill="#e5e7eb" />
        </g>
      ) : (
        <>
          {/* 宜/忌活动 */}
          {content.activity && (
            <text
              x="300"
              y="590"
              fontSize="48"
              textAnchor="middle"
              fontFamily="'Noto Serif SC', 'Songti SC', serif"
              fontWeight="700"
            >
              {content.activity}
            </text>
          )}

          {/* 引言区域 */}
          <foreignObject x="70" y="680" width="460" height="150">
            <div className={styles.quoteText}>{content.quote}</div>
          </foreignObject>

          {/* 来源信息 */}
          <text x="70" y="830" fontSize="16" fontFamily="'Noto Serif SC', 'Songti SC', serif">
            {content.source} · {content.author}
          </text>
        </>
      )}

      {/* 底部品牌字样 */}
      <text x="300" y="875" fontSize="12" textAnchor="middle" style={{ letterSpacing: '10px' }}>
        INSPIRATION CALENDAR
      </text>
    </svg>
  );
};

export default ClassicCalendar;
