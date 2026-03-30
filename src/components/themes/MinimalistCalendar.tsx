import React from 'react';
import { ThemeComponentProps } from '../../types';
import styles from '../../styles/minimalist.module.css';

const COLOR_PRIMARY = '#2C2A28'; // 极致沉稳的暖暮色，拒绝纯黑
const COLOR_SECONDARY = '#7A7571'; // 光学淡化的二级灰
const COLOR_DIVIDER = '#E6DFD7'; // 融入背景的边框线

const MinimalistCalendar: React.FC<ThemeComponentProps> = ({ date, lunar, content, loading }) => {
  const day = date.getDate().toString();

  return (
    <svg viewBox="0 0 600 900" className={styles.calendar} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          {`
            .min-serif { font-family: 'Playfair Display', 'Palatino Linotype', 'Georgia', 'Noto Serif SC', 'Songti SC', serif; }
            .min-sans { font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif; }
            .min-quote { font-family: 'Noto Serif SC', 'Songti SC', 'Palatino Linotype', 'Georgia', serif; font-weight: 400; }
          `}
        </style>
      </defs>

      {/* 取消了原本包围感很强的全画框，改为只在极边缘留下淡淡的刻度锚点线 
          响应 Impeccable: "Don't wrap everything in cards, embrace asymmetry and breathability" */}
      <line x1="40" y1="40" x2="80" y2="40" stroke={COLOR_DIVIDER} strokeWidth="1" />
      <line x1="40" y1="40" x2="40" y2="80" stroke={COLOR_DIVIDER} strokeWidth="1" />

      <line x1="560" y1="860" x2="520" y2="860" stroke={COLOR_DIVIDER} strokeWidth="1" />
      <line x1="560" y1="860" x2="560" y2="820" stroke={COLOR_DIVIDER} strokeWidth="1" />

      {/* 顶部按空间排布对齐，打破绝对居中 */}
      <text
        x="60"
        y="100"
        fontSize="16"
        className="min-sans"
        fill={COLOR_SECONDARY}
        letterSpacing="4"
        style={{ textTransform: 'uppercase' }}
      >
        {lunar.monthInWords}
      </text>
      <text
        x="540"
        y="100"
        fontSize="15"
        textAnchor="end"
        className="min-sans"
        fill={COLOR_SECONDARY}
        letterSpacing="2"
      >
        农历{lunar.lunarMonth}
        {lunar.lunarDay} · {lunar.weekday}
      </text>

      {/* 巨大的西文排版数字，采用优雅的 Playfair Display，利用 fontVariantNumeric 保证光学对齐 */}
      <text
        x="300"
        y="420"
        fontSize="340"
        textAnchor="middle"
        fill={COLOR_PRIMARY}
        className="min-serif"
        style={{ letterSpacing: '-8px', fontVariantNumeric: 'lining-nums' }}
      >
        {day}
      </text>

      {loading ? (
        <g opacity="0.4">
          <animate attributeName="opacity" values="0.3;0.5;0.3" dur="2s" repeatCount="indefinite" />
          <rect x="230" y="520" width="140" height="40" rx="2" fill={COLOR_SECONDARY} />
          <rect x="70" y="640" width="460" height="20" rx="2" fill={COLOR_SECONDARY} />
          <rect x="70" y="680" width="380" height="20" rx="2" fill={COLOR_SECONDARY} />
          <rect x="70" y="815" width="140" height="18" rx="4" fill={COLOR_SECONDARY} />
        </g>
      ) : (
        <>
          {content.activity && (
            <text
              x="300"
              y="530"
              fontSize="40"
              textAnchor="middle"
              fill={COLOR_PRIMARY}
              className="min-serif"
              style={{ letterSpacing: '8px' }}
            >
              {content.activity}
            </text>
          )}

          {/* 左对齐排布，以正体衬线和留白制造文学呼吸感 */}
          <foreignObject x="80" y="620" width="440" height="180">
            <div
              className={`${styles.quoteText} min-quote`}
              style={{
                textAlign: 'left',
                color: COLOR_PRIMARY,
                lineHeight: '2.2',
              }}
            >
              {content.quote}
            </div>
          </foreignObject>

          <text
            x="80"
            y="820"
            fontSize="15"
            className="min-sans"
            fill={COLOR_SECONDARY}
            letterSpacing="1"
          >
            {content.source ? `—— ${content.source}` : '——'} · {content.author}
          </text>
        </>
      )}
    </svg>
  );
};

export default MinimalistCalendar;
