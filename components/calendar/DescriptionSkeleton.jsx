// components/calendar/DescriptionSkeleton.jsx
export default function DescriptionSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="animate-pulse">
        <div className="space-y-4">
          <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
          <div className="h-4 w-4/5 bg-gray-200 rounded"></div>

          <div className="mt-6">
            <div className="h-4 w-1/2 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
