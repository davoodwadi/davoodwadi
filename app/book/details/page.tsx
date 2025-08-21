import { Suspense } from "react";
import BookingDetailsPage from "./BookingDetailsPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading booking details...</div>}>
      <BookingDetailsPage />
    </Suspense>
  );
}
