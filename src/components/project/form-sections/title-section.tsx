import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ProjectFormValues } from "../project-form";

interface TitleSectionProps {
  form: UseFormReturn<ProjectFormValues>;
}

export function TitleSection({ form }: TitleSectionProps) {
  return (
    <FormField
      control={form.control}
      name="title"
      render={({ field }) => (
        <FormItem className="mb-6">
          <FormLabel className="text-white text-base ">Title*</FormLabel>
          <FormControl>
            <Input 
              placeholder="Project Title" 
              {...field} 
              className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm"
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}