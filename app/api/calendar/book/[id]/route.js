import { NextResponse } from "next/server";
import zoomService from "@/lib/zoom";

// const client_email = process.env.GOOGLE_CLIENT_EMAIL!;
// const private_key = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
// const calendarId = process.env.GOOGLE_CALENDAR_ID!;

export async function POST(req, { params }) {
  const { id } = await params;
  //   const booking = await req.json();
  //   console.log("booking", booking);
  //   return NextResponse.json({ meeting: booking });
  try {
    const { selectedTime, selectedTimezone, fullName, email, purpose } =
      await req.json();
    // console.log(
    //   "selectedTime, selectedTimezone, fullName, email, purpose",
    //   selectedTime,
    //   selectedTimezone,
    //   fullName,
    //   email,
    //   purpose
    // );
    // return NextResponse.json({ meeting: selectedTime });

    if (!selectedTime || !fullName || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const startTime = new Date(selectedTime);
    console.log("startTime.toISOString()", startTime.toISOString());
    // const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // +30 minutes
    // Create Zoom meeting
    const meetingData = {
      topic: `Consultation with ${fullName}`,
      start_time: startTime.toISOString(),
      attendeeName: fullName,
      attendeeEmail: email,
      message: `Consultation with ${fullName}
      ${purpose}`,
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
        selectedTimezone,
        attendee: {
          fullName,
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
