import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, isSameDay } from "date-fns";

// Separate component for booking confirmation
export default function BookingConfirmationForm({
  selectedDate,
  selectedTime,
  selectedTimezone,
  isConfirmDisabled,
  isBooking,
  onConfirmBooking,
}) {
  return (
    <div className="w-full pb-16">
      <Card className="rounded-none">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4">
            {selectedDate && selectedTime ? (
              <div className="text-center">
                <p className="text-lg font-medium">Confirm your appointment.</p>
                <p className="text-muted-foreground">
                  {format(selectedDate, "EEEE, MMMM do, yyyy")} at{" "}
                  {format(new Date(selectedTime), "h:mm a")} {selectedTimezone}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-muted-foreground">
                  Please select a date and time to continue
                </p>
              </div>
            )}

            <Button
              onClick={onConfirmBooking}
              disabled={isConfirmDisabled || isBooking}
              size="lg"
              className="w-full max-w-sm"
            >
              {isBooking ? "Confirming..." : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
