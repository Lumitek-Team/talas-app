"use client";

import { FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn, useWatch, Controller } from "react-hook-form";
import { ProjectFormValues } from "../project-form";
import { CategoryType } from "@/lib/type";

interface CategorySectionProps {
  form: UseFormReturn<ProjectFormValues>;
  availableCategories: CategoryType[];
  isLoading?: boolean;
}

export function CategorySection({
  form,
  availableCategories,
  isLoading
}: CategorySectionProps) {
  // Get the current value of the 'category' field from react-hook-form
  // Current value used for active styling
  const currentCategoryValue = useWatch({
    control: form.control,
    name: "category", // The name of the field in your form schema
  });

  if (isLoading) {
    return (
      <div className="mb-6"> {/* Consistent margin with other sections */}
        <FormLabel className="text-white text-base mb-3 block">Category*</FormLabel>
        <div className="flex flex-wrap gap-2 mt-2">
          {/* Skeleton loaders for categories */}
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="h-8 w-24 rounded-full bg-white/5 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    // It's best practice to wrap custom inputs in a Controller or FormField
    // for full integration with react-hook-form, including error display.
    <Controller
      control={form.control}
      name="category"
      render={({ field, fieldState: { error } }) => (
        <div className="mb-6"> {/* Consistent margin */}
          <FormLabel className="text-white text-base mb-3 block">Category*</FormLabel>
          <div className="flex flex-wrap gap-2 mt-2">
            {availableCategories.map((category) => (
              <button
                key={category.id}
                type="button" // Important to prevent form submission
                onClick={() => {
                  // Update the form value using field.onChange or form.setValue
                  field.onChange(category.id);
                  // Optionally, trigger validation if needed immediately
                  // form.trigger("category");
                }}
                className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-all duration-200 active:scale-90 ${
                  currentCategoryValue === category.id || field.value === category.id // Check against watched value or field value
                    ? "bg-primary text-white hover:bg-primary/80"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {category.title}
              </button>
            ))}
          </div>
          {error && (
            <FormMessage className="mt-2">{error.message}</FormMessage>
          )}
        </div>
      )}
    />
  );
}