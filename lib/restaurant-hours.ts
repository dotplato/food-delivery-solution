// Restaurant opening hours (dummy data for now)
export const RESTAURANT_HOURS = {
  monday: { open: '12:00', close: '23:00' },
  tuesday: { open: '12:00', close: '23:00' },
  wednesday: { open: '12:00', close: '23:00' },
  thursday: { open: '12:00', close: '23:00' },
  friday: { open: '12:00', close: '2:00' },
  saturday: { open: '12:00', close: '2:00' },
  sunday: { open: '12:00', close: '23:00' }
};

export function getCurrentDay(): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
}

export function getCurrentTime(): string {
  const now = new Date();
  return now.toTimeString().slice(0, 5); // Returns HH:MM format
}

export function isRestaurantOpen(): boolean {
  const currentDay = getCurrentDay();
  const currentTime = getCurrentTime();
  
  const todayHours = RESTAURANT_HOURS[currentDay as keyof typeof RESTAURANT_HOURS];
  
  if (!todayHours) {
    return false; // Restaurant is closed on this day
  }
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
}

export function getNextOpeningTime(): string {
  const currentDay = getCurrentDay();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDayIndex = days.indexOf(currentDay);
  
  // Check next 7 days
  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (currentDayIndex + i) % 7;
    const nextDay = days[nextDayIndex];
    const nextDayHours = RESTAURANT_HOURS[nextDay as keyof typeof RESTAURANT_HOURS];
    
    if (nextDayHours) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `${dayNames[nextDayIndex]} at ${nextDayHours.open}`;
    }
  }
  
  return 'Soon';
}

export function getTodayHours(): { open: string; close: string } | null {
  const currentDay = getCurrentDay();
  return RESTAURANT_HOURS[currentDay as keyof typeof RESTAURANT_HOURS] || null;
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
} 