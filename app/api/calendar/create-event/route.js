import { google } from "googleapis";
import { NextResponse } from "next/server";

const client_email = process.env.GOOGLE_CLIENT_EMAIL;
const private_key = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
const calendarId = process.env.GOOGLE_CALENDAR_ID;

export async function POST(request) {
  try {
    const { meeting } = await request.json();
    // console.log("meeting", meeting);
    if (!meeting) {
      return NextResponse.json(
        { error: "meeting details are required" },
        { status: 400 }
      );
    }

    // Set up Google Auth
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: client_email,
        private_key: private_key,
      },
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    const client = await auth.getClient();
    const calendar = google.calendar({ version: "v3", auth });

    // Parse the selected time and calculate end time
    const startTime = new Date(meeting?.startTime);
    const endTime = new Date(
      startTime.getTime() + meeting.duration * 60 * 1000
    ); // duration is in minutes

    // Create the calendar event
    const event = {
      summary: meeting.topic || "Consultation Meeting",
      description: `
Zoom Meeting Details:
- Meeting ID: ${meeting.id}
- Join URL: ${meeting.joinUrl}
- Password: ${meeting.password}
- Host Start URL: ${meeting.startUrl}

Attendee: ${meeting.attendee.fullName} (${meeting.attendee.email})
      `.trim(),
      start: {
        dateTime: startTime.toISOString(),
        timeZone: meeting.timezone || "America/Los_Angeles",
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: meeting.timezone || "America/Los_Angeles",
      },
      //   attendees: [
      //     {
      //       email: meeting.attendee.email,
      //       displayName: meeting.attendee.fullName,
      //       responseStatus: "needsAction",
      //     },
      //   ],
      conferenceData: {
        createRequest: {
          requestId: `zoom-${meeting.id}`,
          conferenceSolutionKey: {
            type: "addOn",
          },
        },
        entryPoints: [
          {
            entryPointType: "video",
            uri: meeting.joinUrl,
            label: "Zoom Meeting",
          },
        ],
        conferenceSolution: {
          name: "Zoom",
          iconUri: "https://zoom.us/favicon.ico",
        },
        conferenceId: meeting.id.toString(),
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // 24 hours before
          { method: "popup", minutes: 15 }, // 15 minutes before
        ],
      },
      visibility: "private",
    };

    // Insert the event
    const response = await calendar.events.insert({
      calendarId: calendarId,
      resource: event,
      conferenceDataVersion: 1, // Required for conference data
      sendUpdates: "all", // Send invites to attendees
    });

    return NextResponse.json({
      success: true,
      eventId: response.data.id,
      eventLink: response.data.htmlLink,
      message: "Calendar event created successfully",
    });
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return NextResponse.json(
      {
        error: "Failed to create calendar event",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
