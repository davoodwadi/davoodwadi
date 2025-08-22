import { NextResponse } from "next/server";
import zoomService from "@/lib/zoom";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, date, time, message } = body;

    // Validation
    if (!name || !email || !date || !time) {
      return NextResponse.json(
        { error: "Name, email, date, and time are required" },
        { status: 400 }
      );
    }

    // Combine date and time into a single DateTime
    const meetingDateTime = new Date(`${date}T${time}`);

    // Check if the meeting time is in the future
    if (meetingDateTime <= new Date()) {
      return NextResponse.json(
        { error: "Meeting time must be in the future" },
        { status: 400 }
      );
    }

    // Create Zoom meeting
    const meetingData = {
      topic: `Meeting with ${name}`,
      start_time: meetingDateTime.toISOString(),
      attendeeName: name,
      attendeeEmail: email,
      message: message,
    };

    const zoomMeeting = await zoomService.createMeeting(meetingData);

    // Return meeting details
    return NextResponse.json({
      success: true,
      meeting: {
        id: zoomMeeting.id,
        topic: zoomMeeting.topic,
        startTime: zoomMeeting.start_time,
        duration: zoomMeeting.duration,
        joinUrl: zoomMeeting.join_url,
        startUrl: zoomMeeting.start_url,
        password: zoomMeeting.password,
        attendee: {
          name,
          email,
        },
      },
    });
  } catch (error) {
    console.error("Meeting creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create meeting" },
      { status: 500 }
    );
  }
}
