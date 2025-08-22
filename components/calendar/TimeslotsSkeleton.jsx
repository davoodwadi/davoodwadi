// components/calendar/TimeslotsSkeleton.jsx
export default function TimeslotsSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="animate-pulse">
        {/* Timezone selector */}
        <div className="mb-4">
          <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
          <div className="h-10 w-full bg-gray-200 rounded"></div>
        </div>

        {/* Time slots */}
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded mb-3"></div>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-12 w-full bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
