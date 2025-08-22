import SimpleBookingForm from "@/components/SimpleBookingForm";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Schedule a Meeting with {process.env.HOST_NAME || "Me"}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Quick and easy 30-minute Zoom meeting booking. Just pick your
            preferred date and time, and we'll create the meeting instantly!
          </p>
        </div>

        <SimpleBookingForm />
      </div>
    </div>
  );
}
