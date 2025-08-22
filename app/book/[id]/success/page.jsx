import { Suspense } from "react";
import BookingSuccessPage from "./BookingSuccessPage";
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingSuccessPage />
    </Suspense>
  );
}
