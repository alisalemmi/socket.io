import { getPersianDate } from './getPersianDate';

const weekDay = [
  'یک شنبه',
  'دو شنبه',
  'سه شنبه',
  'چهار شنبه',
  'پنج شنبه',
  'جمعه',
  'شنبه'
];

/**
 * - if time was not in this year: `DD MMMM YYYY`
 * - if time was in this year: `DD MMMM`
 * - if time was in this week: `DDDD`
 * - if time was in the yesterday: `'دیروز'`
 * - if time was in this day: `HH:MM || 'امروز'`
 * - if the given time was not valid: `''`
 */
export const getRelativeDate = (time: string | number, getHour = false) => {
  const t = new Date(time);

  const now = getPersianDate(new Date());
  let givenTime: ReturnType<typeof getPersianDate>;

  try {
    givenTime = getPersianDate(t);
  } catch {
    return '';
  }

  return now.year !== givenTime.year
    ? `${givenTime.day} ${givenTime.month} ${givenTime.year}`
    : now.month !== givenTime.month || now.day - givenTime.day >= 7
    ? `${givenTime.day} ${givenTime.month}`
    : now.day - givenTime.day > 1
    ? weekDay[t.getDay()]
    : now.day - givenTime.day === 1
    ? 'دیروز'
    : getHour
    ? t.toLocaleTimeString('fa', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'امروز';
};
