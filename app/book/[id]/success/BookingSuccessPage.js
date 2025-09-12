"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Calendar,
  Clock,
  User,
  Mail,
  Video,
  Key,
  Copy,
} from "lucide-react";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export default function BookingSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const bookingId = params.id;
  const sessionId = searchParams.get("session_id");
  console.log("sessionId", sessionId);
  console.log("bookingId", bookingId);

  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState("");

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(""), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  useEffect(() => {
    async function finalizeBooking() {
      console.log("FINALIZE BOOKING");

      try {
        if (sessionId) {
          // Update booking status to confirmed in Redis
          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/booking/${bookingId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                status: "confirmed",
                step: "completed",
                stripeSessionId: sessionId,
                confirmedAt: new Date().toISOString(),
              }),
            }
          );

          // fetch bookingId details
          const r = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/booking/${bookingId}`
          );
          if (r.ok) {
            const booking = await r.json();
            console.log("booking", booking);

            // call zoom api to set up a zoom meeting
            console.log("setting zoom meeting");
            const resp = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/calendar/book/${bookingId}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(booking),
              }
            );
            const { meeting } = await resp.json();
            // send confirmation email using gmail
            console.log("sending confirmation email");
            const emailResp = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/email/send-confirmation`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  booking: booking,
                  meeting: meeting,
                }),
              }
            );
            const emailResult = await emailResp.json();
            console.log("emailResult", emailResult);
            //
            // update meeting details on redis
            await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/booking/${bookingId}`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  meeting: meeting,
                }),
              }
            );

            // create google calendar event in my calendar with meeting details and link to the zoom meeting
            const respCalendar = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/calendar/create-event`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  selectedTime: booking.selectedTime, // Added this missing parameter
                  meeting: meeting,
                }),
              }
            );
            const eventDetails = await respCalendar.json();
            // console.log("eventDetails", eventDetails);
          }
        }

        // Fetch final booking details
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/booking/${bookingId}`
        );
        if (response.ok) {
          const booking = await response.json();
          setBookingData(booking);
        }
      } catch (error) {
        console.error("Error finalizing booking:", error);
      } finally {
        setLoading(false);
      }
    }

    if (bookingId) {
      finalizeBooking();
    }
  }, [bookingId, sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <CardTitle className="text-green-700">Booking Confirmed!</CardTitle>
            <p className="text-sm text-muted-foreground">
              Your appointment has been successfully booked and payment
              processed.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {bookingData && (
              <>
                {/* Appointment Details */}
                <div className="bg-green-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-sm">
                      Appointment Details
                    </span>
                  </div>
                  <p className="text-sm font-medium">
                    {format(
                      new Date(bookingData.selectedTime),
                      "EEEE, MMMM do, yyyy"
                    )}
                  </p>
                  <p className="text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {formatInTimeZone(
                      new Date(bookingData.selectedTime),
                      bookingData.selectedTimezone,
                      "h:mm a"
                    )}{" "}
                    {bookingData.selectedTimezone}
                  </p>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="text-sm">{bookingData.fullName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{bookingData.email}</span>
                  </div>
                </div>

                {/* Meeting Details */}
                {bookingData.meeting && (
                  <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-sm">
                        Meeting Details
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600">
                          Meeting Topic
                        </label>
                        <p className="text-sm">{bookingData.meeting.topic}</p>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-600">
                          Meeting ID
                        </label>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono">
                            {bookingData.meeting.id}
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              copyToClipboard(
                                bookingData.meeting.id.toString(),
                                "id"
                              )
                            }
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          {copySuccess === "id" && (
                            <span className="text-xs text-green-600">
                              Copied!
                            </span>
                          )}
                        </div>
                      </div>

                      {bookingData.meeting.password && (
                        <div>
                          <label className="text-xs font-medium text-gray-600">
                            Meeting Password
                          </label>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-mono">
                              {bookingData.meeting.password}
                            </p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                copyToClipboard(
                                  bookingData.meeting.password,
                                  "password"
                                )
                              }
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            {copySuccess === "password" && (
                              <span className="text-xs text-green-600">
                                Copied!
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-medium text-gray-600">
                          Join Meeting
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <Button
                            size="sm"
                            onClick={() =>
                              window.open(bookingData.meeting.joinUrl, "_blank")
                            }
                            className="text-xs"
                          >
                            <Video className="w-3 h-3 mr-1" />
                            Join Zoom Meeting
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              copyToClipboard(
                                bookingData.meeting.joinUrl,
                                "joinUrl"
                              )
                            }
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          {copySuccess === "joinUrl" && (
                            <span className="text-xs text-green-600">
                              Copied!
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        <p className="font-medium">
                          Duration: {bookingData.meeting.duration} minutes
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-4 bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium">{"What's next?"}</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>{"• You'll receive a confirmation email shortly"}</li>
                    <li>• Calendar invite has been sent to your email</li>
                    <li>• Use the meeting details above to join the call</li>
                    <li>• Save this page or bookmark the meeting link</li>
                  </ul>
                </div>
              </>
            )}

            <Button
              onClick={() => (window.location.href = "/")}
              className="w-full mt-6"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
