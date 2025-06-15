import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ProjectFormValues } from "../project-form";

interface GithubUrlSectionProps {
  form: UseFormReturn<ProjectFormValues>;
}

export function GithubUrlSection({ form }: GithubUrlSectionProps) {
  return (
    <FormField
      control={form.control}
      name="githubUrl"
      render={({ field }) => (
        <FormItem className="mb-6">
          <FormLabel className="text-white text-base mb-2">GitHub</FormLabel>
          <FormControl>
            <Input 
              placeholder="https://github.com/username/project-name" 
              {...field} 
              className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm"
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}