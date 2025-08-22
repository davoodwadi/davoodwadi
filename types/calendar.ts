export interface CalendarEvent {
  title: string;
  start: string;
  end: string;
  type: "free" | "busy";
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface DaySchedule {
  date: string;
  slots: TimeSlot[];
}

export interface AvailabilityData {
  [date: string]: {
    free: Array<{ start: string; end: string }>;
    busy: Array<{ start: string; end: string }>;
  };
}

// Add timezone types
export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}
