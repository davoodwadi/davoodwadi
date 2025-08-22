import Image from "next/image";
import { redirect } from "next/navigation";

// console.log("private_key", private_key);
export default function Home() {
  redirect("/book");
  return (
    <div className="font-sans items-center justify-items-center min-h-screen p-8 pb-20 sm:p-20">
      <main className="flex flex-col items-center w-[100vw]"></main>
      {/* <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer> */}
    </div>
  );
}
