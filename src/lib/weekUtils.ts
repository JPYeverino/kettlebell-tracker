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
