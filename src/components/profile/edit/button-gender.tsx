// import { Button } from "@/components/ui/button"; 

interface GenderButtonProps {
  gender: "MALE" | "FEMALE";
  selectedGender: "MALE" | "FEMALE";
  onSelect: (gender: "MALE" | "FEMALE") => void;
}

export function GenderButton({ gender, selectedGender, onSelect }: GenderButtonProps) {
  const isSelected = gender === selectedGender;

  return (
    <button
      type="button"
      className={`flex items-center justify-center rounded-xl w-20 h-8 text-sm cursor-pointer ${
        isSelected ? "bg-primary text-white" : " bg-white/10 hover:bg-white/20 text-white"
      }`}
      onClick={() => onSelect(gender)}
    >
      {gender.charAt(0).toUpperCase() + gender.slice(1)}
    </button>
  );
}

