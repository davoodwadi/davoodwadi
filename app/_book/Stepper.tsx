export default function Stepper({ step }: { step: number }) {
  const steps = ["Select", "Confirm", "Pay", "Success"];

  return (
    <div className="flex items-center justify-between mb-0 mt-4">
      {steps.map((label, index) => {
        const current = index + 1;
        const isActive = step === current;
        const isDone = step > current;

        return (
          <div key={label} className="flex-1 flex items-center">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold
                  ${
                    isActive
                      ? "bg-green-500 text-white"
                      : isDone
                      ? "bg-green-300 text-white"
                      : "bg-gray-300 text-gray-700"
                  }`}
              >
                {current}
              </div>
              <span className="mt-2 text-xs font-medium">{label}</span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-1 ${
                  step > current ? "bg-green-400" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
