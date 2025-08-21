"use client";

import { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment-timezone";

const localizer = momentLocalizer(moment);
// console.log("NEXT_PUBLIC_API_URL", process.env.NEXT_PUBLIC_API_URL);
export default function FreeTimesCalendar() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    async function loadFreeTimes() {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/api/calendar/freetimes"
      );
      const data = await res.json();

      const newEvents: any[] = [];

      // Flatten free slots into events
      Object.entries(data).forEach(([date, slots]: [string, any]) => {
        slots.free.forEach((slot: any) => {
          newEvents.push({
            // title: "Book",
            start: new Date(slot.start),
            end: new Date(slot.end),
            allDay: false,
          });
        });
      });

      setEvents(newEvents);
      // console.log("data", data);
      // console.log("events", events);
    }

    loadFreeTimes();
  }, []);
  return (
    <div className="bg-white rounded-xl shadow-md text-xs w-full">
      <h2 className="px-8 text-xl font-bold mb-4">
        Book an appointment with Davood Wadi
      </h2>
      <Calendar
        className="px-8"
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="week"
        views={["day", "week", "month"]}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: "#2ecc71", // green, modern shade
            color: "white",
            fontWeight: "600",
            border: "none",
          },
        })}
        style={{
          height: "80vh",
          background: "white",
        }}
      />
    </div>
  );
}
