import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type UsernameFieldProps = {
  label: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showAt?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
};

export function InputForm({
  label,
  value,
  onChange,
  showAt = false,
  readOnly = false,
  disabled = false,
}: UsernameFieldProps) {
  return (
    <div className="w-full flex flex-col gap-2">
      <Label className="block">{label}</Label>
      <div className="relative w-full">
        {showAt && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white select-none pointer-events-none">
            @ |
          </span>
        )}
        <Input
          className={`bg-[#fff0] ${showAt ? "pl-10" : ""}`}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
