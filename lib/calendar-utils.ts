import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isToday,
  isPast,
  isSaturday,
  isSunday,
} from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import type {
  CalendarEvent,
  TimeSlot,
  DaySchedule,
  TimezoneOption,
} from "@/types/calendar";

export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function getCommonTimezones(): TimezoneOption[] {
  const timezones = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Toronto",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Asia/Kolkata",
    "Australia/Sydney",
    "Pacific/Auckland",
  ];

  return timezones.map((tz) => {
    const now = new Date();
    const offset = formatInTimeZone(now, tz, "xxx");
    const label = tz.replace("_", " ").replace("/", " / ");

    return {
      value: tz,
      label: `${label} (${offset})`,
      offset,
    };
  });
}

export function formatTimeSlot(
  start: string,
  end: string,
  timezone: string
): string {
  const startTime = formatInTimeZone(new Date(start), timezone, "h:mm a");
  const endTime = formatInTimeZone(new Date(end), timezone, "h:mm a");
  return `${startTime} - ${endTime}`;
}

export function formatTimeSlotShort(start: string, timezone: string): string {
  return formatInTimeZone(new Date(start), timezone, "h:mm a");
}

export function formatDateInTimezone(date: Date, timezone: string): string {
  return formatInTimeZone(date, timezone, "yyyy-MM-dd");
}

export function groupEventsByDate(
  events: CalendarEvent[],
  timezone: string
): Map<string, CalendarEvent[]> {
  const grouped = new Map<string, CalendarEvent[]>();

  events.forEach((event) => {
    const date = formatInTimeZone(
      new Date(event.start),
      timezone,
      "yyyy-MM-dd"
    );
    if (!grouped.has(date)) {
      grouped.set(date, []);
    }
    grouped.get(date)!.push(event);
  });

  return grouped;
}

export function createTimeSlotsFromEvents(events: CalendarEvent[]): TimeSlot[] {
  return events
    .map((event) => ({
      start: event.start,
      end: event.end,
      available: event.type === "free",
    }))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

export function isSlotBookable(start: string): boolean {
  const slotTime = new Date(start);
  const now = new Date();

  // Can't book past slots
  if (isPast(slotTime)) return false;

  // Must be at least 2 hours in advance
  const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  return slotTime >= twoHoursFromNow;
}

// New functions for day status
export function isWeekend(date: Date): boolean {
  return isSaturday(date) || isSunday(date);
}

export function isDayFullyBooked(
  date: Date,
  events: CalendarEvent[],
  timezone: string
): boolean {
  const dateKey = formatInTimeZone(date, timezone, "yyyy-MM-dd");
  const dayEvents = events.filter((event) => {
    const eventDate = formatInTimeZone(
      new Date(event.start),
      timezone,
      "yyyy-MM-dd"
    );
    return eventDate === dateKey;
  });

  // A day is fully booked if it has no available slots or all available slots are not bookable
  const availableSlots = dayEvents.filter((event) => event.type === "free");

  if (availableSlots.length === 0) {
    return true;
  }

  // Check if all available slots are not bookable (too soon or past)
  const bookableSlots = availableSlots.filter((slot) =>
    isSlotBookable(slot.start)
  );
  return bookableSlots.length === 0;
}

export function hasAvailableSlots(
  date: Date,
  events: CalendarEvent[],
  timezone: string
): boolean {
  const dateKey = formatInTimeZone(date, timezone, "yyyy-MM-dd");
  const dayEvents = events.filter((event) => {
    const eventDate = formatInTimeZone(
      new Date(event.start),
      timezone,
      "yyyy-MM-dd"
    );
    return eventDate === dateKey && event.type === "free";
  });

  return dayEvents.some((slot) => isSlotBookable(slot.start));
}
