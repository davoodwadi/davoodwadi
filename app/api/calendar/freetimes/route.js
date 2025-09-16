import { google } from "googleapis";
import { toZonedTime } from "date-fns-tz";
import ical from "node-ical";

const client_email = process.env.GOOGLE_CLIENT_EMAIL;
const private_key = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"); //?.replace(/\\n/g, "\n");
const calendarId = process.env.GOOGLE_CALENDAR_ID;
const calendarId2 = process.env.GOOGLE_CALENDAR_ID2;

export async function GET() {
  //   console.log("GET WORKS");
  // console.log("calendarId2", calendarId2);
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: client_email,
      private_key: private_key,
    },
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  const client = await auth.getClient();
  const calendar = google.calendar({ version: "v3", auth });

  // ----- 90-day window -----
  const startTime = new Date();
  const endTime = new Date();
  endTime.setDate(startTime.getDate() + 90);
  const now = new Date();
  //

  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: startTime.toISOString(),
      timeMax: endTime.toISOString(),
      items: [{ id: calendarId }, { id: calendarId2 }],
    },
  });
  // res.data.calendars[calendarId].busy = array of busy time ranges
  const busyData1 = res.data.calendars?.[calendarId]?.busy || [];
  const busyData2 = res.data.calendars?.[calendarId2]?.busy || [];
  // get Outlook busy times
  const busyDataOutlookUCanWest = await fetch_outlook_calendar_busy({
    startDate: startTime,
    endDate: endTime,
    calendar: "ucanwest",
  });
  const busyDataOutlookHEC = await fetch_outlook_calendar_busy({
    startDate: startTime,
    endDate: endTime,
    calendar: "hec",
  });
  //
  // const canwestbusy = busyDataOutlookUCanWest.map((e) => {
  // const s = new Date(e.start);
  // const en = new Date(e.end);
  // console.log(
  //   s.toLocaleTimeString("en-CA", {
  //     timezone: "America/Los_Angeles",
  //   })
  // );
  // console.log(
  //   en.toLocaleTimeString("en-CA", {
  //     timezone: "America/Los_Angeles",
  //   })
  // );
  // console.log("***********");
  // });
  // console.log("busyDataOutlookUCanWest", busyDataOutlookUCanWest);
  // console.log("busyDataOutlookHEC", busyDataOutlookHEC);
  const busyData = [
    ...busyData1,
    ...busyData2,
    ...busyDataOutlookUCanWest,
    ...busyDataOutlookHEC,
  ];

  // console.log("busyData2", busyData2);
  // console.log("busyData", busyData);
  // Convert busy slots into Dates
  const busySlots = busyData.map((b) => ({
    start: new Date(b.start),
    end: new Date(b.end),
  }));
  // console.log("busySlots", busySlots);
  //
  const results = {};

  for (let i = 0; i < 90; i++) {
    const day = new Date(now);
    day.setDate(now.getDate() + i);
    const dateStr = toDateString(day, "America/Los_Angeles");

    const freeBlocks = computeFreeSlotsForDay(busySlots, day, now);
    // console.log("freeBlocks", freeBlocks);

    // 🔹 Break down each free block into 30min chunks
    const free30MinChunks = freeBlocks.flatMap((block) =>
      splitIntoChunks(block, 30)
    );

    const busy = busySlots
      .filter(
        (b) =>
          toDateString(b.start, "America/Los_Angeles") === dateStr ||
          toDateString(b.end, "America/Los_Angeles") === dateStr
      )
      .map((b) => ({ start: b.start.toISOString(), end: b.end.toISOString() }));

    results[dateStr] = { free: free30MinChunks, busy };
  }
  //
  // console.log("results", results);

  return Response.json(results);
}
/**
 * Compute free sub-intervals for a single day's 9-12 PST block
 */
function computeFreeSlotsForDay(busySlots, day, now) {
  const free = [];

  // Define 9 AM PST -> 12 PM PST
  // const timeZone = "America/Los_Angeles";
  const timeZone = "America/Los_Angeles";
  const dateStr = toDateString(day, timeZone); // "YYYY-MM-DD"
  // console.log("dateStr", dateStr);
  // Build `2024-06-03T09:00:00` in that zone and convert to UTC
  // const start = toZonedTime(`${dateStr}T09:00:00`, timeZone);
  // const end = toZonedTime(`${dateStr}T12:00:00`, timeZone);
  // Create dates explicitly in the target timezone
  const start = new Date(`${dateStr}T09:00:00-07:00`); // PST offset
  const end = new Date(`${dateStr}T12:00:00-07:00`); // PST offset
  // console.log("start", start);
  // console.log("busySlots", busySlots);
  // console.log("start", start);
  // console.log("end", end);
  // const start = new Date(
  //   new Date(day).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  // );
  // start.setHours(9, 0, 0, 0);

  // const end = new Date(start);
  // end.setHours(12, 0, 0, 0);

  let current = start;

  busySlots
    .filter((b) => b.end > start && b.start < end) // overlap with 9-12
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .forEach((b) => {
      // if start is in the future
      if (current < b.start && current > now) {
        free.push({
          start: current.toISOString(),
          end: b.start.toISOString(),
        });
      }
      if (b.end > current) {
        current = b.end;
      }
    });
  // if start is in the future
  if (current < end && current > now) {
    free.push({
      start: current.toISOString(),
      end: end.toISOString(),
    });
  }

  return free;
}

async function fetch_outlook_calendar_busy({ startDate, endDate, calendar }) {
  let ICS_URL;
  try {
    // Your Outlook ICS URL

    if (calendar === "hec") {
      console.log("hec");
      ICS_URL = process.env.OUTLOOK_ICS_URL_HEC;
    } else if (calendar === "ucanwest") {
      ICS_URL = process.env.OUTLOOK_ICS_URL; // Store this in .env.local
    }

    if (!ICS_URL) {
      return "Outlook ICS URL not configured";
    }

    // Fetch the ICS data
    const events = await ical.async.fromURL(ICS_URL);

    // Parse busy times
    const busyTimes = parseOutlookBusyTimes(events, startDate, endDate);
    return busyTimes;
  } catch (error) {
    console.error("Error fetching Outlook calendar:", error);
    return "Failed to fetch calendar data";
  }
}
function parseOutlookBusyTimes(events, startDate, endDate) {
  const busyTimes = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (const eventId in events) {
    const event = events[eventId];

    // Only process VEVENT components (actual events)
    // console.log("event.type", event.type, event.start, event.end);
    if (event.type !== "VEVENT") continue;

    // Skip all-day events or events without start/end times
    if (!event.start || !event.end) continue;

    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    // Check if event falls within our query range
    if (eventEnd >= start && eventStart <= end) {
      // Check if the event shows as "busy" (skip if marked as free)
      // FBTYPE or TRANSP properties indicate free/busy status
      const isBusy =
        !event.transparency || event.transparency !== "TRANSPARENT";
      // console.log("event", event);
      if (isBusy) {
        busyTimes.push({
          start: eventStart.toISOString(),
          end: eventEnd.toISOString(),
          title: event.summary || "Busy",
          // Optionally include more details:
          //   location: event.location,
          //   description: event.description,
        });
      }
    }
  }

  return busyTimes;
}

/**
 * Convert a JS date into a YYYY-MM-DD string in a given timezone
 */
function toDateString(date, timeZone) {
  return date.toLocaleDateString("en-CA", { timeZone }); // e.g., "2024-06-03"
}

// 🔹 Break a free block into 30-min chunks
function splitIntoChunks(range, minutes = 30) {
  const slots = [];

  let cur = new Date(range.start);
  const end = new Date(range.end);

  while (cur < end) {
    const next = new Date(cur.getTime() + minutes * 60 * 1000);
    if (next <= end) {
      slots.push({
        start: cur.toISOString(),
        end: next.toISOString(),
      });
    }
    cur = next;
  }

  return slots;
}
