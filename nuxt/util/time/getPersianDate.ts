export const getPersianDate = (date: number | string | Date) => {
  const d = new Date(date);

  if (!date || isNaN(d.getTime())) throw new Error('invalid Date');

  const [day, month, year] = d
    .toLocaleDateString('fa', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    .replace(/([۰-۹])/g, token =>
      String.fromCharCode(token.charCodeAt(0) - 1728)
    )
    .split(' ');

  return {
    day: +day,
    month,
    year: +year
  };
};

export const isSameDay = (
  date1: number | string | Date,
  date2: number | string | Date
) => {
  const d1 = getPersianDate(date1);
  const d2 = getPersianDate(date2);

  return d1.day === d2.day && d1.month === d2.month && d1.year === d2.year;
};
