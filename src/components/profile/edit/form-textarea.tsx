import { AtSign } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type UsernameFieldProps = {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

export function TextAreaForm({ label, value, onChange }: UsernameFieldProps) {
  return (
    <div className="w-full flex flex-col gap-2">
      <Label className="block">{label}</Label>
      <Textarea className="block bg-[#fff0]" value={value} onChange={onChange} />
    </div>
  );
}