import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ProjectFormValues } from "../project-form";

interface FigmaUrlSectionProps {
  form: UseFormReturn<ProjectFormValues>;
}

export function FigmaUrlSection({ form }: FigmaUrlSectionProps) {
  return (
    <FormField
      control={form.control}
      name="figmaUrl"
      render={({ field }) => (
        <FormItem className="mb-6">
          <FormLabel className="text-white text-base mb-2">Figma</FormLabel>
          <FormControl>
            <Input 
              placeholder="https://www.figma.com/file/project-id/Project-Name" 
              {...field} 
              className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm"
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}