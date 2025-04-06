import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { senderSchema, emailSettingsSchema } from "@shared/schema";
import type { Sender, EmailSettings } from "@/types";

interface SenderFormProps {
  onSubmit: (data: { sender: Sender, emailSettings: EmailSettings }) => void;
}

export function SenderForm({ onSubmit }: SenderFormProps) {
  const senderForm = useForm<Sender>({
    resolver: zodResolver(senderSchema),
    defaultValues: {
      name: "",
      company: "",
      productDescription: "",
      email: "",
      phone: "",
      position: "",
    },
  });

  const emailSettingsForm = useForm<EmailSettings>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      tone: "Professional",
      customPrompt: "",
      size: "Medium (100-200 words)",
      customWordCount: null,
    },
  });

  const handleSubmit = (senderData: Sender) => {
    const emailSettings = emailSettingsForm.getValues();
    onSubmit({ sender: senderData, emailSettings });
  };

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium mb-4">Sender Information</h3>
      <p className="text-sm text-gray-500 mb-6">This information will be used to personalize the emails.</p>
      
      <Form {...senderForm}>
        <form onSubmit={senderForm.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={senderForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={senderForm.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Inc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={senderForm.control}
            name="productDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product/Service Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe what you are selling..." 
                    className="resize-none"
                    rows={4}
                    {...field} 
                  />
                </FormControl>
                <p className="text-xs text-gray-500 mt-1">Brief description of your product or service offering</p>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-md font-medium mb-3">Contact Information</h4>
            <p className="text-xs text-gray-500 mb-3">This contact information may be included in your email signature</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={senderForm.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Position</FormLabel>
                    <FormControl>
                      <Input placeholder="Sales Manager" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={senderForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-4">
              <FormField
                control={senderForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Form {...emailSettingsForm}>
            <FormField
              control={emailSettingsForm.control}
              name="tone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Tone</FormLabel>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Professional">Professional</SelectItem>
                      <SelectItem value="Friendly">Friendly</SelectItem>
                      <SelectItem value="Casual">Casual</SelectItem>
                      <SelectItem value="Formal">Formal</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>

          <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800">
            Continue to Upload
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default SenderForm;
