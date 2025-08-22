// components/calendar/LazyComponents.jsx
import { lazy } from "react";

export const LazyCalendarComponent = lazy(() => import("./CalendarComponent"));
export const LazyTimeSlotsComponents = lazy(() =>
  import("./TimeSlotsComponent")
);
export const LazyDescriptionCard = lazy(() => import("./DescriptionCard"));
export const LazyBookingConfirmationForm = lazy(() =>
  import("./BookingConfirmationForm")
);

export const LazyBookingDetailsSkeleton = lazy(() =>
  import("./BookingDetailsSkeleton")
);
