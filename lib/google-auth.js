import { google } from "googleapis";

export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const calendar = google.calendar({ version: "v3", auth: oauth2Client });

// Generate auth URL
export function getAuthUrl() {
  const scopes = [
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ];

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });
}

// Create calendar event with Meet
export async function createMeetEvent(accessToken, eventDetails) {
  try {
    // Set credentials
    oauth2Client.setCredentials({ access_token: accessToken });

    const event = {
      summary: eventDetails.title,
      description: eventDetails.description,
      start: {
        dateTime: new Date(eventDetails.startTime).toISOString(),
        timeZone: eventDetails.timeZone || "America/New_York",
      },
      end: {
        dateTime: new Date(eventDetails.endTime).toISOString(),
        timeZone: eventDetails.timeZone || "America/New_York",
      },
      attendees: eventDetails.attendees?.map((email) => ({
        email: email.trim(),
      })),
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}-${Math.random()}`,
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 10 },
        ],
      },
      guestsCanModify: false,
      guestsCanInviteOthers: true,
      guestsCanSeeOtherGuests: true,
    };

    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: "all",
    });

    return {
      success: true,
      event: response.data,
      meetLink: response.data.hangoutLink,
      eventId: response.data.id,
      htmlLink: response.data.htmlLink,
    };
  } catch (error) {
    console.error("Error creating event:", error);
    throw new Error(`Failed to create event: ${error.message}`);
  }
}
