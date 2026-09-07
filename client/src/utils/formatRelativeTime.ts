import dayjs, { type Dayjs } from 'dayjs';
import type { Language } from '@client/src/i18n/LanguageContext';

/**
 * 相对时间格式化：距上次调奶的时长 → 展示文本
 *
 * 规则（距上次调奶时长 x）：
 *   x < 60 min          → "n m ago"          (en) / "n 分钟前" (zh)
 *   60 min ≤ x < 24 h   → "n h m m ago"      (en, m=0 时省略分钟) / "n 小时 m 分钟前" (zh, m=0 省略)
 *   24 h ≤ x ≤ 3 天     → "n days ago"       (en) / "n 天前" (zh)
 *   x > 3 天            → 同年 "MM-DD"；跨年 "YYYY-MM-DD"
 *
 * 示例（en）：23 m ago / 1 h 45 m ago / 2 h ago / 2 days ago / 03-12 / 2025-10-01
 * 示例（zh）：23 分钟前 / 1 小时 45 分钟前 / 2 小时前 / 2 天前 / 03-12 / 2025-10-01
 */
export function formatRelativeTime(
  target: Date | string | Dayjs,
  language: Language = 'en',
  now: Date | Dayjs = new Date(),
): string {
  const targetDay = dayjs(target);
  const nowDay = dayjs(now);
  const minutes = nowDay.diff(targetDay, 'minute');
  const hours = nowDay.diff(targetDay, 'hour');
  const days = nowDay.diff(targetDay, 'day');

  // 0..60 min
  if (minutes < 60) {
    const m = Math.max(0, minutes);
    return language === 'zh' ? `${m} 分钟前` : `${m} m ago`;
  }

  // 1h..24h
  if (hours < 24) {
    const m = nowDay.diff(targetDay, 'minute') - hours * 60;
    if (language === 'zh') {
      return m === 0 ? `${hours} 小时前` : `${hours} 小时 ${m} 分钟前`;
    }
    return m === 0 ? `${hours} h ago` : `${hours} h ${m} m ago`;
  }

  // 1d..3d
  if (days <= 3) {
    return language === 'zh' ? `${days} 天前` : `${days} days ago`;
  }

  // > 3d：同年 MM-DD，跨年 YYYY-MM-DD
  const sameYear = targetDay.year() === nowDay.year();
  const date = language === 'zh'
    ? targetDay.format(sameYear ? 'MM-DD' : 'YYYY-MM-DD')
    : targetDay.format(sameYear ? 'MM-DD' : 'YYYY-MM-DD');
  return date;
}
