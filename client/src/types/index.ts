export interface Sender {
  name: string;
  company: string;
  productDescription: string;
  email?: string;
  phone?: string;
  position?: string;
}

export type EmailTone = "Professional" | "Friendly" | "Casual" | "Formal";
export type EmailSize = "Short (50-100 words)" | "Medium (100-200 words)" | "Long (200-300 words)" | "Custom";

export interface EmailSettings {
  tone: EmailTone;
  customPrompt?: string;
  size: EmailSize;
  customWordCount?: number | null;
}

export interface Lead {
  name: string;
  companyName: string;
  productDescription?: string;
  email?: string;
}

export interface GeneratedEmail {
  lead: Lead;
  subject: string;
  body: string;
}

export interface CSVRow {
  NAME: string;
  "COMPANY NAME": string;
  "PRODUCT DESCRIPTION": string;
  [key: string]: string;
}

export interface EmailPreviewProps {
  emails: GeneratedEmail[];
  onExport: () => void;
  onRegenerateEmail?: (index: number) => Promise<void>;
  onUpdateEmail?: (index: number, updatedEmail: Partial<GeneratedEmail>) => void;
  sender?: Sender;
  emailSettings?: EmailSettings;
}
