/**
 * get time at `HH:MM`. if `time` was not valid return `now`
 * @param time Date
 */
export const getTime = (time: string | number) => {
  let t = new Date(time);
  if (isNaN(t.getTime())) t = new Date();

  return t.toLocaleTimeString('fa', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });
};
