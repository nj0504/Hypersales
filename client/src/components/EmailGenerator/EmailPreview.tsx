import { useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { EmailPreviewProps } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function EmailPreview({ 
  emails, 
  onExport, 
  onRegenerateEmail, 
  onUpdateEmail,
  sender,
  emailSettings 
}: EmailPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedBody, setEditedBody] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();
  
  if (!emails.length) {
    return null;
  }

  const currentEmail = emails[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? emails.length - 1 : prev - 1));
    if (editMode) cancelEdit();
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === emails.length - 1 ? 0 : prev + 1));
    if (editMode) cancelEdit();
  };

  const enterEditMode = () => {
    setEditMode(true);
    setEditedSubject(currentEmail.subject);
    setEditedBody(currentEmail.body);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditedSubject("");
    setEditedBody("");
  };

  const saveEdit = () => {
    if (onUpdateEmail) {
      onUpdateEmail(currentIndex, {
        subject: editedSubject,
        body: editedBody
      });
      setEditMode(false);
      toast({
        title: "Email updated",
        description: "Your changes have been saved",
      });
    }
  };

  const handleRegenerate = async () => {
    if (!onRegenerateEmail || !sender || !emailSettings) {
      toast({
        title: "Cannot regenerate",
        description: "Missing required information for regeneration",
        variant: "destructive",
      });
      return;
    }

    setIsRegenerating(true);
    try {
      await onRegenerateEmail(currentIndex);
      toast({
        title: "Email regenerated",
        description: "A new email has been generated",
      });
    } catch (error) {
      toast({
        title: "Regeneration failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <>
      <div className="mt-8 bg-white rounded-md shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Email Preview</h3>
          <div className="flex space-x-2">
            {!editMode ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={enterEditMode}
                  className="text-blue-600 border-blue-600"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={isRegenerating || !onRegenerateEmail}
                  className="text-green-600 border-green-600"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isRegenerating ? 'animate-spin' : ''}`} />
                  {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveEdit}
                  className="text-green-600 border-green-600"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelEdit}
                  className="text-red-600 border-red-600"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="border border-gray-200 rounded-md p-4 mb-4">
          {!editMode ? (
            <>
              <div className="mb-3">
                <span className="text-sm font-medium">Subject:</span>
                <p className="text-sm">{currentEmail.subject}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Body:</span>
                <p className="text-sm whitespace-pre-line">{currentEmail.body}</p>
              </div>
            </>
          ) : (
            <>
              <div className="mb-3">
                <label className="text-sm font-medium block mb-1">Subject:</label>
                <Input 
                  value={editedSubject} 
                  onChange={(e) => setEditedSubject(e.target.value)} 
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Body:</label>
                <Textarea 
                  value={editedBody} 
                  onChange={(e) => setEditedBody(e.target.value)} 
                  className="w-full min-h-[200px]"
                />
              </div>
            </>
          )}
          
          <div className="mt-4 p-2 bg-gray-50 rounded-md border border-gray-100">
            <p className="text-xs text-gray-500">
              <strong>Recipient:</strong> {currentEmail.lead.name} at {currentEmail.lead.companyName}
            </p>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button
            variant="outline"
            className="text-blue-600 border-blue-600"
            onClick={goToPrevious}
            disabled={editMode}
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
            disabled={editMode}
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
