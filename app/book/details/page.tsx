"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export default function BookingDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [purpose, setPurpose] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get booking data from URL parameters
  const time = searchParams.get("time");
  const timezone = searchParams.get("timezone");
  //   console.log(
  //     "formatLocalTime(time, timezone)",
  //     formatLocalTime(time, timezone)
  //   );
  let displayTime = "";
  if (!time) {
    displayTime = "";
  } else {
    displayTime = `${format(new Date(time), "EEEE, MMMM do, yyyy")} at
                      ${formatLocalTime(time, timezone)} ${timezone}`;
    //   console.log("displayTime", displayTime);
  }

  // Redirect if no booking data
  useEffect(() => {
    if (!displayTime) {
      router.push("/book");
    }
  }, [displayTime, router]);

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        time: time,
        fullName: fullName.trim(),
        email: email.trim(),
        purpose: purpose.trim() || undefined,
      };

      console.log("Submitting booking:", bookingData);

      // Make your API call here
      //   const response = await fetch(
      //     process.env.NEXT_PUBLIC_API_URL + "/api/book",
      //     {
      //       method: "POST",
      //       headers: { "Content-Type": "application/json" },
      //       body: JSON.stringify(bookingData),
      //     }
      //   );

      //   if (response.ok) {
      //     // Redirect to success page
      //     router.push("/book/success");
      //   } else {
      //     throw new Error("Booking failed");
      //   }
    } catch (error) {
      console.error("Booking submission failed:", error);
      alert("Booking failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Time:</strong> {displayTime}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <div>
                <Label className="pb-1" htmlFor="fullName">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label className="pb-1" htmlFor="email">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <Label className="pb-1" htmlFor="purpose">
                  Purpose of Meeting (Optional)
                </Label>
                <Textarea
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Briefly describe the purpose of your meeting"
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Confirm Booking"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper function to format time with timezone
const formatLocalTime = (isoString: string, timezone: string) => {
  return formatInTimeZone(new Date(isoString), timezone, "h:mm a");
};
