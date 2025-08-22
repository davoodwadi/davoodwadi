// Skeleton component
export default function BookingDetailsSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="w-full max-w-md">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-20 bg-gray-200 rounded"></div>
          <div className="border rounded-lg p-6">
            <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
            <div className="h-16 w-full bg-gray-100 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="h-10 w-full bg-gray-100 rounded"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-10 w-full bg-gray-100 rounded"></div>
              <div className="h-4 w-40 bg-gray-200 rounded"></div>
              <div className="h-24 w-full bg-gray-100 rounded"></div>
              <div className="h-12 w-full bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
