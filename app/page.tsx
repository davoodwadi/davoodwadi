import Image from "next/image";

const private_key = process.env.GOOGLE_PRIVATE_KEY;
// console.log("private_key", private_key);
// import FreeTimesCalendar from "@/components/calendar-component";
// import FreeTimesCalendarFull from "@/components/calendar-component-fullcalendar";

export default function Home() {
  return (
    <div className="font-sans items-center justify-items-center min-h-screen p-8 pb-20 sm:p-20">
      <main className="flex flex-col items-center w-[100vw]">
        {/* <FreeTimesCalendar /> */}
        {/* <FreeTimesCalendarFull /> */}
      </main>
      {/* <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer> */}
    </div>
  );
}
