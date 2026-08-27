/* ---- Currency ---- */
export const formatCurrency = (amount: number): string =>
  `₹${amount.toLocaleString('en-IN')}`;

export const formatCurrencyPerHour = (amount: number): string =>
  `₹${amount.toLocaleString('en-IN')}/hr`;

/* ---- Date ---- */
const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00'); // parse as local date
  return date.toLocaleDateString('en-IN', DATE_FORMAT); // e.g. "15 May 2024"
};

export const formatDateShort = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }); // "15 May"
};

/* ---- Time (12-hour) ---- */
export const formatTime = (timeStr: string): string => {
  // Input: "HH:MM" (24-hr), Output: "06:00 PM"
  const [hourStr, minuteStr] = timeStr.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr ?? '00';
  const period = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${String(h12).padStart(2, '0')}:${minute} ${period}`;
};

export const formatTimeRange = (start: string, end: string): string =>
  `${formatTime(start)} – ${formatTime(end)}`;

/* ---- Duration ---- */
export const calcDurationHours = (startTime: string, endTime: string): number => {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  return (eh * 60 + em - (sh * 60 + sm)) / 60;
};

/* ---- Name ---- */
export const getInitials = (name: string): string =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

/* ---- Relative time ---- */
export const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};
