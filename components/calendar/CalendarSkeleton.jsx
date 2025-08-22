// components/calendar/CalendarSkeleton.jsx
export default function CalendarSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="animate-pulse">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded"></div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {[...Array(42)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
