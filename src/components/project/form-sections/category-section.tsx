import { FormLabel } from "@/components/ui/form";
import { Dispatch, SetStateAction } from "react";
import { UseFormReturn } from "react-hook-form";
import { ProjectFormValues } from "../project-form";

interface CategorySectionProps {
  form: UseFormReturn<ProjectFormValues>;
  selectedCategory: string;
  setSelectedCategory: Dispatch<SetStateAction<string>>;
  availableCategories: { id: string; title: string }[];
}

export function CategorySection({ 
  form, 
  selectedCategory, 
  setSelectedCategory, 
  availableCategories 
}: CategorySectionProps) {
  return (
    <div className="mb-8">
      <FormLabel className="text-white text-base mb-3">Category*</FormLabel>
      <div className="flex flex-wrap gap-2 mt-2">
        {availableCategories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => {
              form.setValue("category", category.id);
              setSelectedCategory(category.id);
            }}
            className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-all duration-200 active:scale-90 ${
              selectedCategory === category.id
                ? "bg-primary text-white hover:bg-primary/80"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {category.title}
          </button>
        ))}
      </div>
    </div>
  );
}