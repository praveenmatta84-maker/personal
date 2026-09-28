import { RoutineSlot } from '../types';

export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const minutesToTime = (minutes: number): string => {
  const norm = ((minutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h} hr${h > 1 ? 's' : ''}`;
  return `${m} mins`;
};

export const formatTime12h = (time24: string): string => {
  if (!time24 || !time24.includes(':')) return time24;
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${mStr} ${ampm}`;
};

/**
 * Automatically allocates start and end times sequentially for all slots
 * without conflicts or overlapping, respecting user's desired wake/start time and break buffers.
 */
export const autoAllocateTimes = (
  slots: RoutineSlot[],
  startHourStr: string = '07:30',
  bufferMinutes: number = 15
): RoutineSlot[] => {
  let currentMinutes = timeToMinutes(startHourStr);

  return slots.map((slot, index) => {
    const duration = slot.durationMinutes || 45;
    const startTime = minutesToTime(currentMinutes);
    const endMinutes = currentMinutes + duration;
    const endTime = minutesToTime(endMinutes);

    // Next slot starts after buffer (except for the last one)
    currentMinutes = endMinutes + (index < slots.length - 1 ? bufferMinutes : 0);

    return {
      ...slot,
      startTime,
      endTime,
      order: index + 1,
    };
  });
};

/**
 * Calculates routine completion metrics
 */
export const calculateRoutineStats = (slots: RoutineSlot[]) => {
  const total = slots.length;
  const completed = slots.filter((s) => s.completed).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const totalMinutes = slots.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const completedMinutes = slots
    .filter((s) => s.completed)
    .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

  return {
    total,
    completed,
    percentage,
    totalMinutes,
    completedMinutes,
  };
};
