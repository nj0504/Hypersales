import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GeneratedEmail } from "@/types";

interface EmailPreviewProps {
  emails: GeneratedEmail[];
  onExport: () => void;
}

export function EmailPreview({ emails, onExport }: EmailPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (!emails.length) {
    return null;
  }

  const currentEmail = emails[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? emails.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === emails.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="mt-8 bg-white rounded-md shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium mb-4">Email Preview</h3>
        <div className="border border-gray-200 rounded-md p-4 mb-4">
          <div className="mb-3">
            <span className="text-sm font-medium">Subject:</span>
            <p className="text-sm">{currentEmail.subject}</p>
          </div>
          <div>
            <span className="text-sm font-medium">Body:</span>
            <p className="text-sm whitespace-pre-line">{currentEmail.body}</p>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button
            variant="outline"
            className="text-blue-600 border-blue-600"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="text-sm flex items-center">
            <span>{currentIndex + 1}</span> of <span>{emails.length}</span> emails
          </div>
          <Button
            variant="outline"
            className="text-blue-600 border-blue-600"
            onClick={goToNext}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Button 
          onClick={onExport}
          className="bg-blue-600 text-white px-6 py-6 rounded-md hover:bg-blue-700 transition-all inline-flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Personalized Emails
        </Button>
        <p className="text-xs text-gray-500 mt-2">Download a CSV file containing all personalized emails</p>
      </div>
    </>
  );
}

export default EmailPreview;
