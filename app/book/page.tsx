"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import CalendarComponent from "./CalendarComponent";
import TimeSlotsComponents from "./TimeSlotsComponent";
import DescriptionCard from "./DescriptionCard";
import SkeletonTwoCard from "./SkeletonTwoCard";
import { parse, formatISO } from "date-fns";
import { useRouter } from "next/navigation";

interface CalendarEvent {
  title: string;
  start: string;
  end: string;
  type: "free" | "busy";
}

export default function BookingInterface() {
  const router = useRouter();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  // Get user's browser timezone
  const [selectedTimezone, setSelectedTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [isBooking, setIsBooking] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    async function loadAvailability() {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/api/calendar/freetimes"
      );
      const data = await res.json();
      const newEvents: CalendarEvent[] = [];
      // Loop through daily results
      Object.entries(data).forEach(([_, slots]: [string, any]) => {
        // Free slots → green
        slots.free.forEach((slot: any) => {
          newEvents.push({
            title: "Available",
            start: slot.start,
            end: slot.end,
            type: "free",
          });
        });
        // Busy slots → red
        slots.busy.forEach((slot: any) => {
          newEvents.push({
            title: "Booked",
            start: slot.start,
            end: slot.end,
            type: "busy",
          });
        });
      });
      setEvents(newEvents);
    }
    loadAvailability();
  }, []);
  // console.log("events", events.slice(0, 2));
  //   console.log("selectedTime", selectedTime);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime) return;

    setIsBooking(true);

    try {
      // Combine selectedDate and selectedTime into a single Date object
      // selectedTime is expected to be in "HH:mm" 24-hour format
      // Create a string like "2025-08-20 16:00"
      console.log("selectedTime", selectedTime);

      // Navigate to booking details page with the appointment data
      const searchParams = new URLSearchParams({
        time: selectedTime,
        timezone: selectedTimezone,
      });

      router.push(`/book/details?${searchParams.toString()}`);

      // Reset selections after successful booking
      setSelectedDate(undefined);
      setSelectedTime("");
    } catch (error) {
      console.error("Booking failed:", error);
      alert("Booking failed. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };
  //

  if (!mounted) {
    return <SkeletonTwoCard />;
  }
  const isConfirmDisabled = !selectedDate || !selectedTime;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen md:h-[50vh] py-16 md:py-48 px-8 ">
      <div className="flex flex-col md:flex-row items-center justify-center  w-full">
        <DescriptionCard />

        {/* Calendar Section */}

        <CalendarComponent
          events={events}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
        />

        {/* Time Slots Section */}
        <TimeSlotsComponents
          events={events}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          selectedTimezone={selectedTimezone}
          setSelectedTimezone={setSelectedTimezone}
        />
      </div>
      {/* Confirm Booking Section */}
      <div className="w-full max-w-4xl pb-16">
        <Card className="rounded-none">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              {selectedDate && selectedTime ? (
                <div className="text-center">
                  <p className="text-lg font-medium">
                    Confirm your appointment.
                  </p>
                  <p className="text-muted-foreground">
                    {format(selectedDate, "EEEE, MMMM do, yyyy")} at{" "}
                    {format(new Date(selectedTime), "h:mm a")}{" "}
                    {selectedTimezone}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Please select a date and time to continue
                  </p>
                </div>
              )}

              <Button
                onClick={handleConfirmBooking}
                disabled={isConfirmDisabled || isBooking}
                size="lg"
                className="w-full max-w-sm"
              >
                {isBooking ? "Confirming..." : "Next"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
