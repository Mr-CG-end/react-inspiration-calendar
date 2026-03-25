
import { GoogleGenAI, Type } from "@google/genai";
import { DailyContent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function fetchDailyInspiration(date: Date): Promise<DailyContent> {
  const dateStr = date.toISOString().split('T')[0];
  
  const prompt = `
    基于日期 ${dateStr}，为极简日历提供“每日禅意”内容。
    1. 以“宜”开头的简短活动（例如：“宜独处”，“宜触摸”）。最多 4-6 个字。
    2. 关于生活、艺术或时间的深奥且富有诗意的中文引言。
    3. 引言的作者。
    4. 引言所属的书籍或合集。
    
    使其富有深度和知识分子气息。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            activity: { type: Type.STRING, description: "当天的合适活动，例如：'宜触碰'" },
            quote: { type: Type.STRING, description: "有深意的引言" },
            author: { type: Type.STRING, description: "作者姓名" },
            source: { type: Type.STRING, description: "引言来源" }
          },
          required: ["activity", "quote", "author", "source"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return data;
  } catch (error) {
    console.error("Gemini 错误:", error);
    // 如果 API 调用失败，返回备用内容
    return {
      activity: "宜自省",
      quote: "我以触摸书桌来保护自己，使自己不去感觉肉体是短暂的。",
      author: "切斯瓦夫·米沃什",
      source: "《站在人这边：米沃什五十年文选》"
    };
  }
}