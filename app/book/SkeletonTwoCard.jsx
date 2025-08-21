export default function SkeletonTwoCard() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col md:flex-row items-center justify-center h-screen py-16 md:py-0 md:h-[50vh] px-8 w-full">
        <div className="h-[400px] animate-pulse bg-gray-100 rounded-md" />
        <div className="h-[400px] animate-pulse bg-gray-100 rounded-md" />
        <div className="h-[400px] animate-pulse bg-gray-100 rounded-md" />
      </div>
    </div>
  );
}
