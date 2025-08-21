"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

interface CalendarEvent {
  title: string;
  start: string;
  end: string;
  type: "free" | "busy";
}

export default function AvailabilityCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<CalendarEvent | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

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
  function handleEventClick(info: any) {
    const clickedEvent = info.event.extendedProps as CalendarEvent;

    // Only open booking on "free" slots
    if (clickedEvent.type === "free") {
      setSelectedSlot({
        title: "Available",
        start: info.event.startStr,
        end: info.event.endStr,
        type: "free",
      });
    }
  }
  async function handleBookingSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) return;

    // Call booking API → creates event in Google Calendar
    await fetch("/api/calendar/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        summary: `Appointment with ${name}`,
        description,
        start: selectedSlot.start,
        end: selectedSlot.end,
      }),
    });

    // Update UI → mark slot as booked
    setEvents((prev) =>
      prev.map((ev) =>
        ev.start === selectedSlot.start && ev.end === selectedSlot.end
          ? { ...ev, title: "Booked", type: "busy" }
          : ev
      )
    );

    // Reset modal
    setSelectedSlot(null);
    setName("");
    setDescription("");
  }
  return (
    <div className="p-6 px-8 bg-white rounded-xl shadow-lg w-screen mx-auto ">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        Book appointment with Davood Wadi
      </h2>
      <FullCalendar
        timeZone="local" // <-- show events in viewer's browser timezone
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        allDaySlot={false}
        // slotMinTime="07:00:00"
        // slotMaxTime="16:00:00"
        events={events}
        eventContent={renderEventContent}
        eventClick={handleEventClick}
        expandRows={true} // ✅ expands rows to fill only between 9–12
        height="80vh"
        dayHeaderClassNames="bg-gray-100 text-gray-700 font-semibold text-sm py-2 "
        slotLabelClassNames="text-xs text-gray-500"
        slotLaneContent={(arg) => (
          <span className="text-gray-400 text-xs">{arg.time.text}</span>
        )}
      />
    </div>
  );
}

// 🔹 Tailwind-styled "Available" blocks
function renderEventContent(eventInfo: any) {
  const isFree = eventInfo.event.extendedProps.type === "free";
  return (
    <div
      className={`flex items-center justify-center w-full h-full text-xs font-semibold rounded-sm  ${
        isFree
          ? "bg-green-700 text-white hover:bg-green-600 cursor-pointer !outline-none !focus:outline-none !focus:ring-0 !ring-0"
          : "bg-red-700 text-white !outline-none !focus:outline-none !focus:ring-0 !ring-0"
      }`}
    >
      {eventInfo.event.title}
    </div>
  );
}
