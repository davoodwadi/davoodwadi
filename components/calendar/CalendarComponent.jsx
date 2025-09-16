"use client";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { format, isSameDay, startOfDay } from "date-fns";

export default function CalendarComponent(props) {
  // filter props.events
  // console.log("props.events", props.events.slice(0, 10));
  // Checks if a date is available for booking
  const today = startOfDay(new Date());
  /**
   * Checks if a given date has at least one 'free' event slot
   * that starts in the future.
   * @param {Date} date The day to check.
   * @returns {boolean} True if there's a future free slot, false otherwise.
   */
  const hasFutureFreeSlots = (date) => {
    if (!props.events || props.events.length === 0) return false;

    const now = new Date(); // The current date and time.

    // Use .some() for efficiency. It stops as soon as it finds one match.
    return props.events.some((event) => {
      const eventStartDate = new Date(event.start);
      return (
        event.type === "free" &&
        isSameDay(eventStartDate, date) &&
        eventStartDate > now // This is the crucial check!
      );
    });
  };
  /**
   * A date is considered "fully booked" if it has events scheduled on it,
   * but none of those are free slots in the future. This is for styling.
   * @param {Date} date The day to check.
   * @returns {boolean}
   */
  const isFullyBooked = (date) => {
    if (!props.events || props.events.length === 0) return false;

    // Does the day have any events at all?
    const hasEventsOnDay = props.events.some((event) =>
      isSameDay(new Date(event.start), date)
    );

    // It's fully booked if it has events, but no *future* free ones.
    return hasEventsOnDay && !hasFutureFreeSlots(date);
  };

  /**
   * A date is "available" if it's not a weekend, not in the past,
   * and has at least one future free slot.
   * @param {Date} date The day to check.
   * @returns {boolean}
   */
  const isAvailable = (date) => {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    if (date < today || isWeekend) {
      return false;
    }
    return hasFutureFreeSlots(date);
  };

  return (
    <Card className="h-full w-full rounded-none">
      <CardContent className="pt-6">
        <Calendar
          mode="single"
          selected={props.selectedDate}
          onSelect={(e) => {
            props.setSelectedDate(e);
            props.setSelectedTime("");
          }}
          className="rounded-md border mx-auto"
          modifiers={{
            booked: isFullyBooked,
            available: isAvailable,
          }}
          modifiersClassNames={{
            booked:
              "bg-red-200/50 text-red-500 m-2 rounded-md  dark:bg-red-900/50",
            // "opacity-50 [&>button]:line-through [&>button]:text-muted-foreground",
            // "[&>button]:line-through opacity-100",
            available:
              "bg-green-200/80 text-green-800 m-2 rounded-md font-bold dark:bg-green-900/80 dark:text-green-300",
            today: "m-2",
            disabled: "m-2",
          }}
          disabled={(date) => {
            // Disable past dates, Sundays, and Saturdays
            if (
              date < today ||
              date.getDay() === 0 ||
              date.getDay() === 6 ||
              isFullyBooked(date)
            ) {
              return true;
            }
            // If no events data available, don't disable based on availability
            return false;
          }}
        />
      </CardContent>
    </Card>
  );
}
