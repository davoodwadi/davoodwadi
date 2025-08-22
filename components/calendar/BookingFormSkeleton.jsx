// components/calendar/BookingFormSkeleton.jsx
export default function BookingFormSkeleton() {
  return (
    <div className="w-full pb-16">
      <div className="rounded-none border">
        <div className="pt-6 px-6 pb-6">
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="text-center space-y-2">
              <div className="h-6 w-48 bg-gray-200 rounded mx-auto"></div>
              <div className="h-4 w-64 bg-gray-200 rounded mx-auto"></div>
            </div>
            <div className="h-12 w-full max-w-sm bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
