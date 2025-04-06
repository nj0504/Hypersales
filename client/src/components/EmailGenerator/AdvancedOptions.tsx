import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { emailSettingsSchema } from "@shared/schema";
import { EmailSettings } from "@/types";

interface AdvancedOptionsProps {
  emailSettings: EmailSettings;
  onSettingsChange: (settings: EmailSettings) => void;
}

export function AdvancedOptions({ emailSettings, onSettingsChange }: AdvancedOptionsProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  const form = useForm<EmailSettings>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: emailSettings,
  });

  const watchSize = form.watch("size");
  
  const handleFormChange = (field: keyof EmailSettings, value: any) => {
    form.setValue(field, value);
    onSettingsChange({
      ...form.getValues(),
      [field]: value
    });
  };

  return (
    <>
      <div className={`mt-6 bg-white rounded-md shadow-sm border border-gray-200 p-6 ${isVisible ? '' : 'hidden'}`}>
        <h3 className="text-lg font-medium mb-4">Advanced Email Settings</h3>
        
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="customPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Prompt</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Write a custom prompt to guide the AI in generating emails..." 
                      className="resize-none"
                      rows={3}
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        handleFormChange("customPrompt", e.target.value);
                      }}
                    />
                  </FormControl>
                  <p className="text-xs text-gray-500 mt-1">Customize how the AI generates your emails</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Size</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleFormChange("size", value);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select email size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Short (50-100 words)">Short (50-100 words)</SelectItem>
                      <SelectItem value="Medium (100-200 words)">Medium (100-200 words)</SelectItem>
                      <SelectItem value="Long (200-300 words)">Long (200-300 words)</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchSize === "Custom" && (
              <FormField
                control={form.control}
                name="customWordCount"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Custom Word Count</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter desired word count" 
                        min={50}
                        max={500}
                        value={value || ""}
                        onChange={(e) => {
                          const val = e.target.value === "" ? null : Number(e.target.value);
                          onChange(val);
                          handleFormChange("customWordCount", val);
                        }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </Form>
      </div>

      <div className="mt-4 text-center">
        <button 
          onClick={() => setIsVisible(!isVisible)}
          className="text-blue-600 text-sm inline-flex items-center"
        >
          <span>{isVisible ? 'Hide advanced options' : 'Show advanced options'}</span>
          {isVisible ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
        </button>
      </div>
    </>
  );
}

export default AdvancedOptions;
