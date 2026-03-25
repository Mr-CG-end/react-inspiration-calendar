import React from "react";
import { DailyContent, LunarInfo } from "../types";

interface CalendarSVGProps {
  date: Date;
  lunar: LunarInfo;
  content: DailyContent;
}

const CalendarSVG: React.FC<CalendarSVGProps> = ({ date, lunar, content }) => {
  const day = date.getDate().toString();

  return (
    <svg
      viewBox="0 0 600 900"
      className="w-full h-auto bg-white shadow-2xl border border-gray-100 rounded-2xl overflow-hidden"
      xmlns="http://www.w3.org/2000/svg"
    >
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
      <text x="70" y="105" fontSize="24" className="serif-sc font-bold">
        {lunar.monthInWords}
      </text>
      <text
        x="300"
        y="105"
        fontSize="16"
        textAnchor="middle"
        className="serif-sc"
      >
        农历{lunar.lunarMonth}
        {lunar.lunarDay}
      </text>
      <text
        x="530"
        y="105"
        fontSize="24"
        textAnchor="end"
        className="serif-sc font-bold"
      >
        {lunar.weekday}
      </text>

      {/* 主日期数字 */}
      <text
        x="300"
        y="450"
        fontSize="320"
        textAnchor="middle"
        className="serif-sc font-black"
        style={{ letterSpacing: "-10px" }}
      >
        {day}
      </text>

      {/* 宜/忌活动 */}
      <text
        x="300"
        y="590"
        fontSize="48"
        textAnchor="middle"
        className="serif-sc font-bold"
      >
        {content.activity}
      </text>

      {/* 品牌标识区域 */}
      <g transform="translate(480, 570)">
        <text
          x="0"
          y="6"
          fontSize="14"
          textAnchor="middle"
          className="serif-sc font-black"
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

      {/* 分隔横线 */}
      <line x1="70" y1="650" x2="530" y2="650" stroke="black" strokeWidth="1" />

      {/* 引言区域 */}
      <foreignObject x="70" y="680" width="460" height="150">
        <div className="serif-sc text-black text-3xl leading-relaxed">
          {content.quote}
        </div>
      </foreignObject>

      {/* 来源信息 */}
      <text x="70" y="830" fontSize="16" className="serif-sc">
        {content.source} · {content.author}
      </text>

      {/* 底部品牌字样 */}
      <text
        x="300"
        y="875"
        fontSize="12"
        textAnchor="middle"
        style={{ letterSpacing: "10px" }}
      >
        INSPIRATION CALENDAR
      </text>
    </svg>
  );
};

export default CalendarSVG;
