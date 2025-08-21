import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, isSameDay } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { useState, useEffect } from "react";
import React from "react";
// Common timezones list
const timezones = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "GMT (London)" },
  { value: "Europe/Paris", label: "CET (Paris)" },
  { value: "Asia/Tokyo", label: "JST (Tokyo)" },
  { value: "Australia/Sydney", label: "AEST (Sydney)" },
  {
    value: "UTC",
    label: "UTC",
  },
  // { value: "America/Vancouver", label: "Vancouver" },
];

export default function TimeSlotsComponents(props) {
  // console.log("props.events", props.events.slice(0, 4));
  // if (!props.events)

  // Store timezone preference in localStorage
  useEffect(() => {
    const savedTimezone = localStorage.getItem("userTimezone");
    if (savedTimezone) {
      props.setSelectedTimezone(savedTimezone);
    }
  }, []);

  // Combine your static timezone list with detected timezone (if missing)
  const combinedTimezones = React.useMemo(() => {
    if (!props.selectedTimezone) return timezones;

    const exists = timezones.some((tz) => tz.value === props.selectedTimezone);
    if (exists) return timezones;

    return [
      {
        value: props.selectedTimezone,
        label: props.selectedTimezone.replace("_", " "),
      },
      ...timezones,
    ];
  }, [props.selectedTimezone]);

  // console.log("selectedTimezone", selectedTimezone);
  // Filter events to only show free slots
  const freeSlotsForDay =
    props.events?.filter(
      (event) =>
        event.type === "free" &&
        props.selectedDate &&
        isSameDay(new Date(event.start), props.selectedDate)
    ) || [];

  return (
    <Card className="h-full w-full rounded-none">
      <CardHeader>
        <CardTitle>
          {props.selectedDate
            ? `Available times for ${format(
                props.selectedDate,
                "MMMM do, yyyy"
              )}`
            : "Select a date first"}
        </CardTitle>
        {/* Timezone Selector */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Times shown in {props.selectedTimezone.replace("_", " ")}
          </p>
          {/* <label className="text-sm font-medium">Timezone</label> */}
          <Select
            value={props.selectedTimezone}
            onValueChange={props.setSelectedTimezone}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {combinedTimezones.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {props.selectedDate && freeSlotsForDay.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {freeSlotsForDay.map((slot) => (
              // console.log('slot', slot)
              <Button
                key={`${slot.start}-${slot.end}`}
                variant={
                  props.selectedTime === slot.start ? "default" : "outline"
                }
                onClick={() => props.setSelectedTime(slot.start)}
                className="w-full"
              >
                {formatLocalTime(slot.start, props.selectedTimezone)} -{" "}
                {formatLocalTime(slot.end, props.selectedTimezone)}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            Please select a date to see available times.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to format time with timezone
const formatLocalTime = (isoString, timezone = selectedTimezone) => {
  return formatInTimeZone(new Date(isoString), timezone, "h:mm a");
};
