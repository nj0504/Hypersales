import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/EmailGenerator/Header";
import StepIndicator from "@/components/EmailGenerator/StepIndicator";
import SenderForm from "@/components/EmailGenerator/SenderForm";
import LeadsUpload from "@/components/EmailGenerator/LeadsUpload";
import AdvancedOptions from "@/components/EmailGenerator/AdvancedOptions";
import EmailPreview from "@/components/EmailGenerator/EmailPreview";
import Footer from "@/components/EmailGenerator/Footer";
import { Sender, EmailSettings, Lead, GeneratedEmail } from "@/types";

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [sender, setSender] = useState<Sender>({
    name: "",
    company: "",
    productDescription: "",
  });
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    tone: "Professional",
    customPrompt: "",
    size: "Medium (100-200 words)",
    customWordCount: null,
  });
  const [leads, setLeads] = useState<Lead[]>([]);
  const [generatedEmails, setGeneratedEmails] = useState<GeneratedEmail[]>([]);
  
  const { toast } = useToast();

  const generateEmailsMutation = useMutation({
    mutationFn: async () => {
      // Validate leads before sending
      const validLeads = leads.filter(lead => 
        lead.name && lead.name.trim() !== '' &&
        lead.companyName && lead.companyName.trim() !== ''
      );
      
      if (validLeads.length === 0) {
        throw new Error("Your CSV file does not contain any valid leads. Each lead must have a name and company name.");
      }
      
      const response = await apiRequest(
        "POST", 
        "/api/generate-emails", 
        { sender, emailSettings, leads: validLeads }
      );
      
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Invalid data: All leads must have a name and company name");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Email generation successful, received data:", data);
      
      // Check for valid email data
      if (!data || !data.emails) {
        console.error("Invalid response from server:", data);
        toast({
          title: "Error generating emails",
          description: "Server returned an invalid response. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate emails array
      if (!Array.isArray(data.emails) || data.emails.length === 0) {
        console.error("No emails found in response data");
        toast({
          title: "No emails generated",
          description: "The server did not return any email content. Please try different settings.",
          variant: "destructive",
        });
        setGeneratedEmails([]);
        return;
      }
      
      // Log the first email for debugging
      if (data.emails[0]) {
        console.log("First email subject:", data.emails[0].subject);
        console.log("First email body:", data.emails[0].body);
      }
      
      // Count valid emails (with non-empty content)
      const validEmails = data.emails.filter((email: GeneratedEmail) => 
        email && email.lead && email.lead.name && email.subject && email.body
      );
      
      if (validEmails.length === 0) {
        console.error("All emails are empty or invalid");
        toast({
          title: "Email generation issue",
          description: "The API generated emails but they contain no valid content. Please try again.",
          variant: "destructive",
        });
      } else if (validEmails.length < data.emails.length) {
        toast({
          title: "Some emails were incomplete",
          description: `Only ${validEmails.length} out of ${data.emails.length} emails had valid content.`,
          variant: "destructive",
        });
      }
      
      // Set emails and update UI
      setGeneratedEmails(data.emails);
      setCurrentStep(3);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      
      toast({
        title: "Emails generated successfully",
        description: `${data.emails.length} personalized emails created`,
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      
      // Special handling for missing API key
      if (errorMessage.includes("OPENROUTER_API_KEY environment variable is not set")) {
        toast({
          title: "API Key Missing",
          description: "The OpenRouter API key is not configured. If you're running this locally, please create a .env file with your OPENROUTER_API_KEY. See README.md for instructions.",
          variant: "destructive",
          duration: 10000, // Show for longer
        });
      } else {
        toast({
          title: "Failed to generate emails",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  });

  const regenerateEmailMutation = useMutation({
    mutationFn: async (emailIndex: number) => {
      const lead = leads[emailIndex];
      
      // Validate lead data
      if (!lead.name || lead.name.trim() === '' || 
          !lead.companyName || lead.companyName.trim() === '') {
        throw new Error("Cannot regenerate: Lead must have a name and company name");
      }
      
      const response = await apiRequest(
        "POST", 
        "/api/regenerate-email", 
        { sender, emailSettings, lead }
      );
      
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Invalid lead data: Lead must have a name and company name");
      }
      
      return response.json();
    },
    onSuccess: (data, emailIndex) => {
      // Validate response data
      if (!data || !data.email) {
        console.error("Invalid response from server:", data);
        toast({
          title: "Error regenerating email",
          description: "Server returned an invalid response. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate email content
      if (!data.email.subject || !data.email.body) {
        console.error("Empty email content in response:", data.email);
        toast({
          title: "Email generation issue",
          description: "The API returned an email with empty content. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Update the generated email at the specified index
      const updatedEmails = [...generatedEmails];
      updatedEmails[emailIndex] = data.email;
      setGeneratedEmails(updatedEmails);
      
      console.log("Email regenerated successfully:", data.email);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      
      // Special handling for missing API key
      if (errorMessage.includes("OPENROUTER_API_KEY environment variable is not set")) {
        toast({
          title: "API Key Missing",
          description: "The OpenRouter API key is not configured. If you're running this locally, please create a .env file with your OPENROUTER_API_KEY. See README.md for instructions.",
          variant: "destructive",
          duration: 10000, // Show for longer
        });
      } else {
        toast({
          title: "Failed to regenerate email",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  });

  const updateEmailMutation = useMutation({
    mutationFn: async ({ index, emailData }: { index: number, emailData: Partial<GeneratedEmail> }) => {
      const currentEmail = generatedEmails[index];
      const updatedEmail = {
        lead: currentEmail.lead,
        subject: emailData.subject || currentEmail.subject,
        body: emailData.body || currentEmail.body
      };
      
      const response = await apiRequest(
        "POST", 
        "/api/update-email", 
        updatedEmail
      );
      return { response: response.json(), index };
    },
    onSuccess: (data) => {
      // Email update is handled in handleUpdateEmail
    },
    onError: (error) => {
      toast({
        title: "Failed to update email",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const exportEmailsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "POST", 
        "/api/export-emails", 
        { emails: generatedEmails }
      );
      return response.blob();
    },
    onSuccess: (blob) => {
      // Create a download link for the file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "personalized_emails.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export successful",
        description: "Your personalized emails have been downloaded",
      });
    },
    onError: (error) => {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const handleSenderSubmit = (data: { sender: Sender; emailSettings: EmailSettings }) => {
    setSender(data.sender);
    setEmailSettings(data.emailSettings);
    setCurrentStep(2);
  };

  const handleLeadsUploaded = (uploadedLeads: Lead[]) => {
    setLeads(uploadedLeads);
  };

  const handleSettingsChange = (settings: EmailSettings) => {
    setEmailSettings(settings);
  };

  const handleGenerateEmails = () => {
    if (leads.length === 0) {
      toast({
        title: "No leads uploaded",
        description: "Please upload your leads data before generating emails",
        variant: "destructive",
      });
      return;
    }
    
    generateEmailsMutation.mutate();
  };

  const handleRegenerateEmail = async (index: number) => {
    await regenerateEmailMutation.mutateAsync(index);
  };

  const handleUpdateEmail = (index: number, emailData: Partial<GeneratedEmail>) => {
    // Update the email locally immediately for better UX
    const updatedEmails = [...generatedEmails];
    updatedEmails[index] = {
      ...updatedEmails[index],
      ...(emailData.subject && { subject: emailData.subject }),
      ...(emailData.body && { body: emailData.body })
    };
    
    setGeneratedEmails(updatedEmails);
    
    // Then send the update to the server
    updateEmailMutation.mutate({ index, emailData });
  };

  const handleExportEmails = () => {
    exportEmailsMutation.mutate();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">Generate Personalized Emails</h2>
          <p className="text-sm text-gray-500">Upload your leads and customize emails in three easy steps</p>
        </div>
        
        <StepIndicator currentStep={currentStep} />
        
        <div className="grid md:grid-cols-2 gap-6">
          <SenderForm onSubmit={handleSenderSubmit} />
          
          <LeadsUpload onLeadsUploaded={handleLeadsUploaded} />
        </div>
        
        <AdvancedOptions 
          emailSettings={emailSettings} 
          onSettingsChange={handleSettingsChange} 
        />

        {leads.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={handleGenerateEmails}
              disabled={generateEmailsMutation.isPending}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-all inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generateEmailsMutation.isPending ? "Generating..." : "Generate Personalized Emails"}
            </button>
          </div>
        )}
        
        {currentStep === 3 && generatedEmails.length > 0 && (
          <EmailPreview 
            emails={generatedEmails} 
            onExport={handleExportEmails}
            onRegenerateEmail={handleRegenerateEmail}
            onUpdateEmail={handleUpdateEmail}
            sender={sender}
            emailSettings={emailSettings}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
}
