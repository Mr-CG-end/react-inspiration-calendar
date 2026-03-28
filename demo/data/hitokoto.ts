import type { CalendarContent } from '../../src';

/**
 * 一言 API 响应结构
 * @see https://developer.hitokoto.cn/sentence/
 */
interface HitokotoResponse {
  id: number;
  uuid: string;
  hitokoto: string;
  type: string;
  from: string;
  from_who: string | null;
  creator: string;
  created_at: string;
}

/**
 * 将一言 API 的响应转换为 CalendarContent 格式
 */
function toCalendarContent(data: HitokotoResponse): CalendarContent {
  return {
    activity: '一言',
    quote: data.hitokoto,
    author: data.from_who ?? data.creator ?? '佚名',
    source: data.from || '一言',
  };
}

/**
 * 从一言 API 获取内容
 * 可直接作为 Calendar 组件的 fetchContent prop 使用
 *
 * @example
 * ```tsx
 * import { fetchHitokoto } from './data/hitokoto';
 * <Calendar fetchContent={fetchHitokoto} />
 * ```
 */
export async function fetchHitokoto(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _date: Date,
): Promise<CalendarContent | null> {
  try {
    const res = await fetch('https://v1.hitokoto.cn/?c=d&c=h&c=i&c=k');
    if (!res.ok) return null;
    const data: HitokotoResponse = await res.json();
    return toCalendarContent(data);
  } catch {
    return null;
  }
}
