import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { format, isSameDay } from "date-fns";

export default function CalendarComponent(props) {
  // filter props.events
  // console.log("props.events", props.events.slice(0, 10));
  const isFullyBooked = (date) => {
    if (!props.events || props.events.length === 0) return false;
    const hasFreeSlots = props.events.some(
      (event) => event.type === "free" && isSameDay(new Date(event.start), date)
    );
    return !hasFreeSlots;
  };
  return (
    <Card className="h-full w-full rounded-none">
      <CardContent>
        <Calendar
          mode="single"
          selected={props.selectedDate}
          onSelect={(e) => {
            props.setSelectedDate(e);
            props.setSelectedTime("");
          }}
          className="rounded-md border w-full"
          modifiers={{
            booked: isFullyBooked,
          }}
          modifiersClassNames={{
            booked:
              "opacity-50 [&>button]:line-through [&>button]:text-muted-foreground",
            // "[&>button]:line-through opacity-100",
          }}
          disabled={(date) => {
            // Disable past dates, Sundays, and Saturdays
            if (
              date < new Date() ||
              date.getDay() === 0 ||
              date.getDay() === 6
            ) {
              return true;
            }
            if (isFullyBooked(date)) {
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
