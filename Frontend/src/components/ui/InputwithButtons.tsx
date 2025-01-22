import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ButtonProps {
  placeholder: string;
  type: string;
  onchange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function InputWithButton({ placeholder, type, onchange }: ButtonProps) {
  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Input onChange={onchange} type={type} placeholder={placeholder} />
      <Button type="submit">Search</Button>
    </div>
  );
}
