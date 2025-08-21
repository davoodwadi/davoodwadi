"use client";

import { useState } from "react";
import AvailabilityCalendar from "./AvailabilityCalendar"; // your calendar comp
import Stepper from "./Stepper"; // the stepper from previous answer

export default function BookingStepper() {
  const [step, setStep] = useState(1);
  const [slot, setSlot] = useState<any>(null);

  return (
    <div className="flex flex-col h-screen w-screen bg-white rounded-xl mx-auto">
      {/* Progress Stepper */}
      <div className="">
        <Stepper step={step} />
      </div>
      <div className="h-1/2">
        {/* Step 1: Calendar */}
        {step === 1 && (
          <div>
            <AvailabilityCalendar />

            {/* Next button (enabled only if slot is selected) */}
            <div className="flex justify-end mt-4">
              <button
                disabled={!slot}
                onClick={() => setStep(2)}
                className={`px-4 py-2 rounded-lg text-white 
                ${
                  slot
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Confirmation + Details */}
        {step === 2 && <div></div>}

        {/* Step 3: Payment */}
        {step === 3 && <div></div>}

        {/* Step 4: Success */}
        {step === 4 && <div></div>}
      </div>
    </div>
  );
}
