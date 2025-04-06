import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex justify-between items-center mb-8 max-w-3xl mx-auto">
      <div className="flex flex-col items-center">
        <div 
          className={cn(
            "w-[30px] h-[30px] rounded-full flex items-center justify-center font-medium mb-2",
            currentStep === 1 ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-500"
          )}
        >
          1
        </div>
        <span className="text-xs">Sender Details</span>
      </div>
      <div className="h-px bg-gray-200 flex-1 mx-2"></div>
      <div className="flex flex-col items-center">
        <div 
          className={cn(
            "w-[30px] h-[30px] rounded-full flex items-center justify-center font-medium mb-2",
            currentStep === 2 ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-500"
          )}
        >
          2
        </div>
        <span className="text-xs">Upload Leads</span>
      </div>
      <div className="h-px bg-gray-200 flex-1 mx-2"></div>
      <div className="flex flex-col items-center">
        <div 
          className={cn(
            "w-[30px] h-[30px] rounded-full flex items-center justify-center font-medium mb-2",
            currentStep === 3 ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-500"
          )}
        >
          3
        </div>
        <span className="text-xs">Review & Export</span>
      </div>
    </div>
  );
}

export default StepIndicator;
