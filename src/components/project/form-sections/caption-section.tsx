import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { ProjectFormValues } from "../project-form";

interface CaptionSectionProps {
  form: UseFormReturn<ProjectFormValues>;
}

export function CaptionSection({ form }: CaptionSectionProps) {
  return (
    <FormField
      control={form.control}
      name="caption"
      render={({ field }) => (
        <FormItem className="mb-6">
          <FormLabel className="text-white text-base mb-2">Caption*</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Write a short description about your project..." 
              {...field} 
              className="w-full min-h-[120px] rounded-md border border-white/10 bg-background px-3 py-2 text-sm"
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}