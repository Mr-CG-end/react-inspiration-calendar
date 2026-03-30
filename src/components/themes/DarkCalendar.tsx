import React from 'react';
import { ThemeComponentProps } from '../../types';
import styles from '../../styles/dark.module.css';

const COLOR_GLOW = '#C9A227';

const DarkCalendar: React.FC<ThemeComponentProps> = ({ date, lunar, content, loading }) => {
  const day = date.getDate().toString();

  return (
    <svg viewBox="0 0 600 900" className={styles.calendar} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          {`
            .dark-display { font-family: 'Cinzel', 'Palatino Linotype', 'Bodoni MT', 'Georgia', 'Noto Serif SC', serif; }
            .dark-serif { font-family: 'Noto Serif SC', 'Songti SC', 'Palatino Linotype', 'Georgia', serif; }
            .dark-quote-cn { font-family: 'Noto Serif SC', 'Songti SC', 'Palatino Linotype', 'Georgia', serif; font-weight: 400; }
          `}
        </style>

        {/* 全新重构的金属拉丝质感渐变，消除突兀的亮金色，转为沉静的深古铜金 */}
        <linearGradient id="premiumGold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#DBC277" />
          <stop offset="60%" stopColor="#A88326" />
          <stop offset="100%" stopColor="#5C450B" />
        </linearGradient>

        <linearGradient id="glowGlow" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <stop offset="50%" stopColor="#A88326" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* --- 背景光晕：不是边框，而是一抹非常微弱的中部环境发光，制造深空的舞台灯效 --- */}
      <rect x="0" y="200" width="600" height="500" fill="url(#glowGlow)" opacity="0.8" />

      {/* --- 顶部：隐秘的高级刻度标 --- */}
      {/* 极小的字号，极大的字间距，不喧宾夺主 */}
      <text
        x="60"
        y="80"
        fontSize="15"
        fill={COLOR_GLOW}
        className="dark-serif"
        fontWeight="500"
        letterSpacing="6"
        opacity="0.9"
      >
        {lunar.monthInWords}
      </text>

      {/* 农历信息降级并融入黑暗 */}
      <text
        x="300"
        y="80"
        fontSize="14"
        textAnchor="middle"
        fill={COLOR_GLOW}
        className="dark-serif"
        letterSpacing="2"
        opacity="0.75"
      >
        农历{lunar.lunarMonth}
        {lunar.lunarDay}
      </text>

      <text
        x="540"
        y="80"
        fontSize="15"
        textAnchor="end"
        fill={COLOR_GLOW}
        className="dark-serif"
        fontWeight="500"
        letterSpacing="6"
        opacity="0.9"
      >
        {lunar.weekday}
      </text>

      {/* 极简顶线与底线锚点，取代完整方框 */}
      <line
        x1="60"
        y1="120"
        x2="160"
        y2="120"
        stroke="url(#premiumGold)"
        strokeWidth="1"
        opacity="0.3"
      />
      <line
        x1="440"
        y1="120"
        x2="540"
        y2="120"
        stroke="url(#premiumGold)"
        strokeWidth="1"
        opacity="0.3"
      />

      {/* --- 主数字：庞大、坚固、金属切割感 --- */}
      {/* 移除导致糊状的死黑 textShadow，纯粹依靠极端的字体厚度和沉金渐变取胜，利用 Y 轴上移留白 */}
      <text
        x="300"
        y="420"
        fontSize="320"
        textAnchor="middle"
        fill="url(#premiumGold)"
        className="dark-display"
        fontWeight="600"
        style={{
          letterSpacing: '-6px',
          fontVariantNumeric: 'lining-nums',
        }}
      >
        {day}
      </text>

      {loading ? (
        <g opacity="0.3">
          <animate attributeName="opacity" values="0.1;0.3;0.1" dur="2s" repeatCount="indefinite" />
          <rect x="250" y="520" width="100" height="30" rx="2" fill={COLOR_GLOW} />
          <rect x="120" y="660" width="360" height="20" rx="2" fill={COLOR_GLOW} />
          <rect x="160" y="690" width="280" height="20" rx="2" fill={COLOR_GLOW} />
        </g>
      ) : (
        <>
          {/* --- 宜忌：紧紧依附大数字下方形成主视觉区群组 --- */}
          {content.activity && (
            <text
              x="300"
              y="530"
              fontSize="48"
              textAnchor="middle"
              fill="url(#premiumGold)"
              className="dark-serif"
              fontWeight="900"
              style={{ letterSpacing: '12px' }}
            >
              {content.activity}
            </text>
          )}

          {/* --- 中央断层分界线：极致的呼吸感 --- */}
          {/* 从中心向外消失的虚空线带，没有任何累赘的节点 */}
          <g transform="translate(300, 600)">
            <linearGradient id="fadeLineLeft" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0" />
              <stop offset="100%" stopColor="#A88326" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="fadeLineRight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#A88326" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </linearGradient>
            <rect x="-150" y="0" width="140" height="1" fill="url(#fadeLineLeft)" />
            <rect x="10" y="0" width="140" height="1" fill="url(#fadeLineRight)" />
            {/* 钻石切割感的锚点，极小 */}
            <rect
              x="-1.5"
              y="-1.5"
              width="3"
              height="3"
              fill="#DBC277"
              transform="rotate(45 0 0)"
              opacity="0.8"
            />
          </g>

          {/* --- 引言区域：正体衬线 + 金色辉光的仪式感 --- */}
          <foreignObject x="80" y="650" width="440" height="140">
            <div
              className={`${styles.quoteText} dark-quote-cn`}
              style={{
                color: '#DBC277',
                opacity: 0.85,
                lineHeight: '2.2',
                textAlign: 'center',
              }}
            >
              {content.quote}
            </div>
          </foreignObject>

          {/* --- 来源信息：隐藏入最暗处 --- */}
          <text
            x="300"
            y="790"
            fontSize="14"
            fill={COLOR_GLOW}
            className="dark-serif"
            textAnchor="middle"
            opacity="0.75"
            letterSpacing="2"
          >
            {content.source ? `${content.source}` : ''} ·
            {content.author ? ` ${content.author}` : ''}
          </text>
        </>
      )}

      {/* --- 底部印记 --- */}
      <line
        x1="60"
        y1="860"
        x2="160"
        y2="860"
        stroke="url(#premiumGold)"
        strokeWidth="1"
        opacity="0.3"
      />
      <line
        x1="440"
        y1="860"
        x2="540"
        y2="860"
        stroke="url(#premiumGold)"
        strokeWidth="1"
        opacity="0.3"
      />

      <text
        x="300"
        y="864"
        fontSize="12"
        textAnchor="middle"
        fill={COLOR_GLOW}
        className="dark-display"
        style={{ letterSpacing: '20px' }}
        opacity="0.8"
      >
        INSPIRATION
      </text>
    </svg>
  );
};

export default DarkCalendar;
