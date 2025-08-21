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
      const res = await fetch("/api/calendar/freetimes");
      const data = await res.json();

      const newEvents: CalendarEvent[] = [];

      Object.entries(data).forEach(([_, slots]: [string, any]) => {
        slots.free.forEach((slot: any) => {
          newEvents.push({
            title: "Available",
            start: slot.start,
            end: slot.end,
            type: "free",
          });
        });

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
    <div className="p-6 bg-white rounded-xl shadow-lg max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        My Availability (Next 90 Days)
      </h2>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        allDaySlot={false}
        slotMinTime="09:00:00"
        slotMaxTime="12:00:00"
        expandRows={true}
        height="auto"
        events={events}
        eventContent={renderEventContent}
        eventClassNames={() => "border-0 !p-0 !bg-transparent"}
        eventClick={handleEventClick}
      />

      {/* Booking Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">
              Book This Slot
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {new Date(selectedSlot.start).toLocaleString()} -{" "}
              {new Date(selectedSlot.end).toLocaleString()}
            </p>
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <textarea
                placeholder="Description"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedSlot(null)}
                  className="px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function renderEventContent(eventInfo: any) {
  const isFree = eventInfo.event.extendedProps.type === "free";

  return (
    <div
      className={`flex items-center justify-center w-full h-full text-xs font-semibold rounded-md shadow-sm px-2 ${
        isFree
          ? "bg-green-500 text-white hover:bg-green-600 cursor-pointer"
          : "bg-red-500 text-white line-through"
      }`}
    >
      {eventInfo.event.title}
    </div>
  );
}
