import { google } from "googleapis";

const client_email = process.env.GOOGLE_CLIENT_EMAIL;
const private_key = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n"); //?.replace(/\\n/g, "\n");
const calendarId = process.env.GOOGLE_CALENDAR_ID!;

export async function GET() {
  //   console.log("GET WORKS");
  console.log(client_email);
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: client_email,
      private_key: private_key,
    },
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  const client = await auth.getClient();
  const calendar = google.calendar({ version: "v3", auth: client });

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
      items: [{ id: calendarId }],
    },
  });
  // res.data.calendars[calendarId].busy = array of busy time ranges
  const busyData = res.data.calendars?.[calendarId]?.busy || [];
  // Convert busy slots into Dates
  const busySlots = busyData.map((b) => ({
    start: new Date(b.start!),
    end: new Date(b.end!),
  }));
  //
  const results: Record<
    string,
    {
      free: { start: string; end: string }[];
      busy: { start: string; end: string }[];
    }
  > = {};

  for (let i = 0; i < 90; i++) {
    const day = new Date(now);
    day.setDate(now.getDate() + i);
    const dateStr = toDateString(day, "America/Los_Angeles");

    const freeBlocks = computeFreeSlotsForDay(busySlots, day);

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

  return Response.json(results);
}

/**
 * Compute free sub-intervals for a single day's 9-12 PST block
 */
function computeFreeSlotsForDay(
  busySlots: { start: Date; end: Date }[],
  day: Date
) {
  const free: { start: string; end: string }[] = [];

  // Define 9 AM PST -> 12 PM PST
  const start = new Date(
    new Date(day).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  );
  start.setHours(9, 0, 0, 0);

  const end = new Date(start);
  end.setHours(12, 0, 0, 0);

  let current = start;

  busySlots
    .filter((b) => b.end > start && b.start < end) // overlap with 9-12
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .forEach((b) => {
      if (current < b.start) {
        free.push({
          start: current.toISOString(),
          end: b.start.toISOString(),
        });
      }
      if (b.end > current) {
        current = b.end;
      }
    });

  if (current < end) {
    free.push({
      start: current.toISOString(),
      end: end.toISOString(),
    });
  }

  return free;
}

/**
 * Convert a JS date into a YYYY-MM-DD string in a given timezone
 */
function toDateString(date: Date, timeZone: string) {
  return date.toLocaleDateString("en-CA", { timeZone }); // e.g., "2024-06-03"
}

// 🔹 Break a free block into 30-min chunks
function splitIntoChunks(range: { start: string; end: string }, minutes = 30) {
  const slots: { start: string; end: string }[] = [];

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
