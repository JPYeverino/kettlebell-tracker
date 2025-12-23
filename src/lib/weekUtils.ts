// Get Monday of the week for a given date
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

// Format week start date as YYYY-MM-DD
export function formatWeekStart(date: Date): string {
  const weekStart = getWeekStart(date);
  return weekStart.toISOString().split('T')[0];
}

// Get week end date (Sunday)
export function getWeekEnd(weekStart: Date): Date {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  return end;
}

// Format week range for display
export function formatWeekRange(weekStart: Date): string {
  const end = getWeekEnd(weekStart);
  const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const year = weekStart.getFullYear();

  return `${startMonth} - ${endMonth}, ${year}`;
}

// Navigate to previous/next week
export function addWeeks(weekStart: Date, weeks: number): Date {
  const newDate = new Date(weekStart);
  newDate.setDate(newDate.getDate() + (weeks * 7));
  return getWeekStart(newDate);
}

// Check if a date is in the current week
export function isCurrentWeek(weekStart: Date): boolean {
  const today = formatWeekStart(new Date());
  const week = formatWeekStart(weekStart);
  return today === week;
}

// Get the actual date for a specific day of the week
// dayOfWeek: 1=Mon, 2=Tue, ..., 6=Sat, 0=Sun
export function getDateForDayOfWeek(weekStart: Date, dayOfWeek: number): Date {
  const date = new Date(getWeekStart(weekStart));

  // If it's Sunday (0), add 6 days, otherwise add (dayOfWeek - 1)
  const daysToAdd = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  date.setDate(date.getDate() + daysToAdd);

  return date;
}

// Format a date as MM/DD (e.g., "12/23")
export function formatShortDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
}
