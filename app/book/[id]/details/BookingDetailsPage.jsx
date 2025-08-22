"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { useParams } from "next/navigation";

export default function BookingDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id;
  const bookingIdEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/booking/${bookingId}`;

  // State
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [purpose, setPurpose] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch booking details on mount
  useEffect(() => {
    async function fetchBookingDetails() {
      try {
        console.log("Fetching booking details for:", bookingId);

        const response = await fetch(bookingIdEndpoint);

        if (response.ok) {
          const booking = await response.json();
          console.log("Retrieved booking:", booking);
          setBookingData(booking);

          // Pre-fill form if data exists
          if (booking.fullName) setFullName(booking.fullName);
          if (booking.email) setEmail(booking.email);
          if (booking.purpose) setPurpose(booking.purpose);
        } else if (response.status === 404) {
          console.error("Booking not found");
          router.push("/book");
        } else {
          throw new Error("Failed to fetch booking details");
        }
      } catch (error) {
        console.error("Error fetching booking:", error);
        alert("Failed to load booking details. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId, bookingIdEndpoint, router]);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim()) {
      // alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Update booking with user details
      const response = await fetch(bookingIdEndpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          purpose: purpose.trim() || null,
          status: "details-completed",
          step: "payment",
          updatedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update booking details");
      }

      const updatedBooking = await response.json();
      console.log("Updated booking with user details:", updatedBooking);

      // Create Stripe checkout session
      const checkoutResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingId: bookingId,
          }),
        }
      );

      if (!checkoutResponse.ok) {
        throw new Error("Failed to create payment session");
      }
      const { url, sessionId } = await checkoutResponse.json();
      console.log("sessionId", sessionId);
      console.log("url", url);

      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (error) {
      console.error("Booking submission failed:", error);
      alert("Failed to process booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatBookingTime = () => {
    if (!bookingData?.selectedDate || !bookingData?.selectedTime) {
      return "";
    }

    const date = format(
      new Date(bookingData?.selectedDate),
      "EEEE, MMMM do, yyyy"
    );
    const time = formatInTimeZone(
      new Date(bookingData?.selectedTime),
      bookingData?.selectedTimezone || "UTC",
      "h:mm a"
    );

    return `${date} at ${time}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
          disabled={isSubmitting}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Booking Details
            </CardTitle>

            {/* Booking Summary */}
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Appointment Time:</span>
              </div>
              <p className="text-sm text-blue-800 font-medium">
                {formatBookingTime()}
              </p>
              <p className="text-xs text-blue-600">
                {bookingData?.selectedTimezone}
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <div>
                <Label htmlFor="fullName">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email address"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="purpose">Purpose of Meeting (Optional)</Label>
                <Textarea
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Briefly describe what you'd like to discuss"
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>

              {/* Payment Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Payment Details</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Consultation Fee:</span>
                  <span className="font-bold">140.00 USD</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  You'll be redirected to secure payment after confirming your
                  details.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !fullName.trim() || !email.trim()}
              >
                {isSubmitting ? "Processing..." : "Continue to Payment"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Trust indicators */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Secure payment powered by Stripe</p>
        </div>
      </div>
    </div>
  );
}
