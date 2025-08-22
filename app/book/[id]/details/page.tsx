import { Suspense } from "react";
import BookingDetailsPage from "./BookingDetailsPage";
// import SkeletonTwoCard from "@/components/calendar/SkeletonTwoCard";
// Lazy imports
import { LazyBookingDetailsSkeleton } from "@/components/calendar/LazyComponents";

export default function Page() {
  return (
    <Suspense fallback={<LazyBookingDetailsSkeleton />}>
      <BookingDetailsPage />
    </Suspense>
  );
}
