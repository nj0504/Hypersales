import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";
import os from "os";
import { stringify } from "csv-stringify/sync";
import { leadSchema, senderSchema, emailSettingsSchema } from "@shared/schema";
import type { Lead, GeneratedEmail } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({ dest: os.tmpdir() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Sample CSV download endpoint
  app.get("/api/sample-csv", (req: Request, res: Response) => {
    const sampleData = [
      ["NAME", "COMPANY NAME", "PRODUCT DESCRIPTION"],
      ["Jane Smith", "XYZ Corp", "Software Development"],
      ["John Doe", "ABC Inc", "Digital Marketing"],
      ["Sarah Johnson", "123 Solutions", "Cloud Services"],
    ];

    const csvContent = stringify(sampleData);
    
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=sample_leads.csv");
    res.send(csvContent);
  });

  // CSV upload and parsing endpoint
  app.post("/api/upload-csv", upload.single("file"), (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Read the uploaded file
      const fileContent = fs.readFileSync(req.file.path, "utf8");
      
      // Parse CSV
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      // Map CSV records to Lead objects
      const leads: Lead[] = records.map((record: any) => {
        return {
          name: record.NAME || "",
          companyName: record["COMPANY NAME"] || "",
          productDescription: record["PRODUCT DESCRIPTION"] || "",
          email: record.EMAIL || "",
        };
      });

      // Validate each lead
      const validatedLeads: Lead[] = [];
      for (const lead of leads) {
        try {
          const validLead = leadSchema.parse(lead);
          validatedLeads.push(validLead);
        } catch (error) {
          console.error("Invalid lead data:", error);
          // Skip invalid entries
        }
      }

      // Clean up the temporary file
      fs.unlinkSync(req.file.path);

      return res.status(200).json({
        message: "CSV processed successfully",
        leads: validatedLeads,
      });
    } catch (error) {
      console.error("Error processing CSV:", error);
      return res.status(500).json({
        message: "Failed to process CSV file",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Email generation endpoint
  app.post("/api/generate-emails", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const schema = z.object({
        sender: senderSchema,
        emailSettings: emailSettingsSchema,
        leads: z.array(leadSchema),
      });

      const validatedData = schema.parse(req.body);
      
      // OpenRouter API integration
      const openRouterApiKey = process.env.OPENROUTER_API_KEY;
      
      // Generate emails for each lead
      const generatedEmails: GeneratedEmail[] = [];
      
      for (const lead of validatedData.leads) {
        // Determine word count range based on email size setting
        let wordCountPrompt = "";
        if (validatedData.emailSettings.size === "Short (50-100 words)") {
          wordCountPrompt = "Keep the email between 50-100 words.";
        } else if (validatedData.emailSettings.size === "Medium (100-200 words)") {
          wordCountPrompt = "Keep the email between 100-200 words.";
        } else if (validatedData.emailSettings.size === "Long (200-300 words)") {
          wordCountPrompt = "Keep the email between 200-300 words.";
        } else if (validatedData.emailSettings.size === "Custom" && validatedData.emailSettings.customWordCount) {
          wordCountPrompt = `Keep the email around ${validatedData.emailSettings.customWordCount} words.`;
        }

        // Build the prompt for the AI
        let promptContent = `
        You are an expert email copywriter. Write a personalized sales email with the following details:

        SENDER INFORMATION:
        - Name: ${validatedData.sender.name}
        - Company: ${validatedData.sender.company}
        - Product/Service: ${validatedData.sender.productDescription}

        RECIPIENT INFORMATION:
        - Name: ${lead.name}
        - Company: ${lead.companyName}
        ${lead.productDescription ? `- Product/Service: ${lead.productDescription}` : ''}

        INSTRUCTIONS:
        - Use a ${validatedData.emailSettings.tone.toLowerCase()} tone
        - Create both a subject line and email body
        - Format your response as: "SUBJECT: <subject line>\n\nBODY:\n<email body>"
        - ${wordCountPrompt}
        - Personalize the email to the recipient's company and needs
        ${validatedData.emailSettings.customPrompt ? `- Additional instructions: ${validatedData.emailSettings.customPrompt}` : ''}
        `;

        // Make API call to OpenRouter
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openRouterApiKey}`,
            "HTTP-Referer": process.env.REPLIT_DOMAINS || "https://localhost:5000",
            "X-Title": "AI Email Generator"
          },
          body: JSON.stringify({
            model: "qwen/qwen2.5-vl-32b-instruct:free",
            messages: [
              { role: "user", content: promptContent }
            ],
            temperature: 0.7,
            max_tokens: 1000
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`OpenRouter API error: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        
        // Parse the AI response to extract subject and body
        const aiResponse = data.choices[0].message.content;
        
        let subject = "";
        let body = "";
        
        const subjectMatch = aiResponse.match(/SUBJECT:\s*(.*?)(?:\n|$)/i);
        if (subjectMatch && subjectMatch[1]) {
          subject = subjectMatch[1].trim();
        }
        
        const bodyMatch = aiResponse.match(/BODY:\s*([\s\S]*)/i);
        if (bodyMatch && bodyMatch[1]) {
          body = bodyMatch[1].trim();
        }
        
        // Add placeholders for name and company in body
        const enhancedBody = body
          .replace(/\b(NAME)\b/gi, `{{${lead.name}}}`)
          .replace(/\b(COMPANY)\b/gi, `{{${lead.companyName}}}`);

        // Add generated email to results
        generatedEmails.push({
          lead,
          subject,
          body: enhancedBody
        });
      }

      return res.status(200).json({
        message: "Emails generated successfully",
        emails: generatedEmails
      });
    } catch (error) {
      console.error("Error generating emails:", error);
      return res.status(500).json({
        message: "Failed to generate emails",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Regenerate a single email
  app.post("/api/regenerate-email", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const schema = z.object({
        sender: senderSchema,
        emailSettings: emailSettingsSchema,
        lead: leadSchema,
      });

      const validatedData = schema.parse(req.body);
      
      // OpenRouter API integration
      const openRouterApiKey = process.env.OPENROUTER_API_KEY;
      
      // Determine word count range based on email size setting
      let wordCountPrompt = "";
      if (validatedData.emailSettings.size === "Short (50-100 words)") {
        wordCountPrompt = "Keep the email between 50-100 words.";
      } else if (validatedData.emailSettings.size === "Medium (100-200 words)") {
        wordCountPrompt = "Keep the email between 100-200 words.";
      } else if (validatedData.emailSettings.size === "Long (200-300 words)") {
        wordCountPrompt = "Keep the email between 200-300 words.";
      } else if (validatedData.emailSettings.size === "Custom" && validatedData.emailSettings.customWordCount) {
        wordCountPrompt = `Keep the email around ${validatedData.emailSettings.customWordCount} words.`;
      }

      // Build the prompt for the AI
      let promptContent = `
      You are an expert email copywriter. Write a personalized sales email with the following details:

      SENDER INFORMATION:
      - Name: ${validatedData.sender.name}
      - Company: ${validatedData.sender.company}
      - Product/Service: ${validatedData.sender.productDescription}

      RECIPIENT INFORMATION:
      - Name: ${validatedData.lead.name}
      - Company: ${validatedData.lead.companyName}
      ${validatedData.lead.productDescription ? `- Product/Service: ${validatedData.lead.productDescription}` : ''}

      INSTRUCTIONS:
      - Use a ${validatedData.emailSettings.tone.toLowerCase()} tone
      - Create both a subject line and email body
      - Format your response as: "SUBJECT: <subject line>\n\nBODY:\n<email body>"
      - ${wordCountPrompt}
      - Personalize the email to the recipient's company and needs
      ${validatedData.emailSettings.customPrompt ? `- Additional instructions: ${validatedData.emailSettings.customPrompt}` : ''}
      `;

      // Make API call to OpenRouter
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openRouterApiKey}`,
          "HTTP-Referer": process.env.REPLIT_DOMAINS || "https://localhost:5000",
          "X-Title": "AI Email Generator"
        },
        body: JSON.stringify({
          model: "qwen/qwen2.5-vl-32b-instruct:free",
          messages: [
            { role: "user", content: promptContent }
          ],
          temperature: 0.8, // Slightly higher temperature for more variation
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenRouter API error: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      
      // Parse the AI response to extract subject and body
      const aiResponse = data.choices[0].message.content;
      
      let subject = "";
      let body = "";
      
      const subjectMatch = aiResponse.match(/SUBJECT:\s*(.*?)(?:\n|$)/i);
      if (subjectMatch && subjectMatch[1]) {
        subject = subjectMatch[1].trim();
      }
      
      const bodyMatch = aiResponse.match(/BODY:\s*([\s\S]*)/i);
      if (bodyMatch && bodyMatch[1]) {
        body = bodyMatch[1].trim();
      }
      
      // Add placeholders for name and company in body
      const enhancedBody = body
        .replace(/\b(NAME)\b/gi, `{{${validatedData.lead.name}}}`)
        .replace(/\b(COMPANY)\b/gi, `{{${validatedData.lead.companyName}}}`);

      return res.status(200).json({
        message: "Email regenerated successfully",
        email: {
          lead: validatedData.lead,
          subject,
          body: enhancedBody
        }
      });
    } catch (error) {
      console.error("Error regenerating email:", error);
      return res.status(500).json({
        message: "Failed to regenerate email",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Update an email
  app.post("/api/update-email", (req: Request, res: Response) => {
    try {
      // Validate request body
      const schema = z.object({
        lead: leadSchema,
        subject: z.string(),
        body: z.string(),
      });

      const validatedData = schema.parse(req.body);
      
      return res.status(200).json({
        message: "Email updated successfully",
        email: {
          lead: validatedData.lead,
          subject: validatedData.subject,
          body: validatedData.body
        }
      });
    } catch (error) {
      console.error("Error updating email:", error);
      return res.status(500).json({
        message: "Failed to update email",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Email export endpoint
  app.post("/api/export-emails", (req: Request, res: Response) => {
    try {
      const { emails } = req.body;
      
      if (!Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({ message: "No emails to export" });
      }
      
      // Create CSV data
      const csvRows = [
        ["Recipient Name", "Recipient Company", "Subject", "Email Body"]
      ];
      
      emails.forEach((email: GeneratedEmail) => {
        csvRows.push([
          email.lead.name,
          email.lead.companyName,
          email.subject,
          email.body.replace(/\n/g, " ")
        ]);
      });
      
      const csvContent = stringify(csvRows);
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=personalized_emails.csv");
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting emails:", error);
      return res.status(500).json({
        message: "Failed to export emails",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
