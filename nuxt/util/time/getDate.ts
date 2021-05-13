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
export const getDate = (time: string | number, getHour = false) => {
  const t = new Date(time);
  const now = new Date();

  if (!time || isNaN(t.getTime())) return '';

  const [nd, nMonth, nYear] = now
    .toLocaleDateString('fa', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    .replace(/([۰-۹])/g, token =>
      String.fromCharCode(token.charCodeAt(0) - 1728)
    )
    .split(' ');

  const nDay = +nd;

  const [td, tMonth, tYear] = t
    .toLocaleDateString('fa', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    .replace(/([۰-۹])/g, token =>
      String.fromCharCode(token.charCodeAt(0) - 1728)
    )
    .split(' ');

  const tDay = +td;

  if (nYear !== tYear) return `${tDay} ${tMonth} ${tYear}`;
  if (nMonth !== tMonth || nDay - tDay >= 7) return `${tDay} ${tMonth}`;
  if (nDay - tDay > 1) return weekDay[t.getDay()];
  if (nDay - tDay === 1) return 'دیروز';
  if (getHour)
    return t.toLocaleTimeString('fa', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  return 'امروز';
};
