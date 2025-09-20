"use client";

import { useState, useEffect, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

// Lazy imports
import {
  LazyCalendarComponent,
  LazyTimeSlotsComponents,
  LazyDescriptionCard,
  LazyBookingConfirmationForm,
} from "@/components/calendar/LazyComponents";

// Skeleton imports
import CalendarSkeleton from "@/components/calendar/CalendarSkeleton";
import TimeslotsSkeleton from "@/components/calendar/TimeslotsSkeleton";
import DescriptionSkeleton from "@/components/calendar/DescriptionSkeleton";
import BookingFormSkeleton from "@/components/calendar/BookingFormSkeleton";

const freetimesEndpoint =
  process.env.NEXT_PUBLIC_API_URL + "/api/calendar/freetimes";

export default function BookingInterface() {
  const params = useParams();
  const bookingId = params.id;
  const bookingIdEndpoint =
    process.env.NEXT_PUBLIC_API_URL + `/api/booking/${bookingId}`;

  const [bookingExists, setBookingExists] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize booking only once
  useEffect(() => {
    async function initializeBooking() {
      try {
        console.log("Initializing Booking ID:", bookingId);

        const response = await fetch(bookingIdEndpoint);

        if (response.ok) {
          console.log("Booking exists:", bookingId);
          setBookingExists(true);
        } else if (response.status === 404) {
          const newBookingResponse = await fetch(bookingIdEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: bookingId,
              status: "active",
              step: "date-time-selection",
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              createdAt: new Date().toISOString(),
            }),
          });

          if (newBookingResponse.ok) {
            console.log("Created new booking:", bookingId);
            setBookingExists(true);
          } else {
            throw new Error("Failed to create booking");
          }
        } else {
          throw new Error("Failed to initialize booking");
        }
      } catch (error) {
        console.error("Error initializing booking:", error);
        setBookingExists(true);
      } finally {
        setIsInitializing(false);
      }
    }

    if (bookingId) {
      initializeBooking();
    }
  }, [bookingId, bookingIdEndpoint]);

  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState();
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedTimezone, setSelectedTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [isBooking, setIsBooking] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load calendar availability
  useEffect(() => {
    async function loadAvailability() {
      const res = await fetch(freetimesEndpoint);
      const data = await res.json();
      // console.log("data", data);
      const newEvents = [];

      Object.entries(data).forEach(([_, slots]) => {
        slots.free.forEach((slot) => {
          newEvents.push({
            title: "Available",
            start: slot.start,
            end: slot.end,
            type: "free",
          });
        });

        slots.busy.forEach((slot) => {
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime) return;

    setIsBooking(true);

    try {
      await fetch(bookingIdEndpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedDate: selectedDate.toISOString(),
          selectedTime,
          selectedTimezone,
          step: "details",
          status: "pending-details",
          updatedAt: new Date().toISOString(),
        }),
      });

      //   const searchParams = new URLSearchParams({
      //     time: selectedTime,
      //     timezone: selectedTimezone,
      //   });

      router.push(`/book/${bookingId}/details`);
    } catch (error) {
      console.error("Booking confirmation failed:", error);
      alert("Booking failed. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const isConfirmDisabled = !selectedDate || !selectedTime;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen lg:h-[50vh] py-16 lg:py-48 px-8">
      <div className="flex flex-col lg:flex-row items-center justify-center w-full">
        {/* Description Card with Suspense */}
        <Suspense fallback={<DescriptionSkeleton />}>
          <LazyDescriptionCard />
        </Suspense>

        {/* Calendar Component with Suspense */}
        <Suspense fallback={<CalendarSkeleton />}>
          <LazyCalendarComponent
            events={events}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
          />
        </Suspense>

        {/* Time Slots Component with Suspense */}
        <Suspense fallback={<TimeslotsSkeleton />}>
          <LazyTimeSlotsComponents
            events={events}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            selectedTimezone={selectedTimezone}
            setSelectedTimezone={setSelectedTimezone}
          />
        </Suspense>
      </div>

      {/* Booking Form with Suspense */}
      <Suspense fallback={<BookingFormSkeleton />}>
        <LazyBookingConfirmationForm
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          selectedTimezone={selectedTimezone}
          isConfirmDisabled={isConfirmDisabled}
          isBooking={isBooking}
          onConfirmBooking={handleConfirmBooking}
        />
      </Suspense>
    </div>
  );
}
