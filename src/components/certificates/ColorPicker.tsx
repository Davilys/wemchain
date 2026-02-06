import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, Palette } from "lucide-react";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  presets?: string[];
}

const DEFAULT_PRESETS = [
  "#0a3d6e", // Dark blue (WebMarcas default)
  "#0066cc", // Blue accent
  "#1e40af", // Royal blue
  "#7c3aed", // Purple
  "#059669", // Emerald
  "#dc2626", // Red
  "#ea580c", // Orange
  "#ca8a04", // Yellow
  "#0d9488", // Teal
  "#4f46e5", // Indigo
  "#ec4899", // Pink
  "#374151", // Gray
];

export function ColorPicker({ 
  value, 
  onChange, 
  label, 
  presets = DEFAULT_PRESETS 
}: ColorPickerProps) {
  const [hexInput, setHexInput] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHexInput(value);
  }, [value]);

  const handleHexChange = (newValue: string) => {
    // Allow partial input
    setHexInput(newValue);
    
    // Only apply if valid hex
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleHexBlur = () => {
    // Reset to current value if invalid
    if (!/^#[0-9A-Fa-f]{6}$/.test(hexInput)) {
      setHexInput(value);
    }
  };

  const handlePresetClick = (color: string) => {
    onChange(color);
    setHexInput(color);
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label className="font-body text-sm flex items-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          {label}
        </Label>
      )}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-11"
          >
            <div
              className="h-6 w-6 rounded-md border border-border shadow-sm"
              style={{ backgroundColor: value }}
            />
            <span className="font-mono text-sm">{value.toUpperCase()}</span>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-64 p-4" align="start">
          <div className="space-y-4">
            {/* Color input */}
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={value}
                onChange={(e) => handlePresetClick(e.target.value)}
                className="h-10 w-10 rounded-md border border-border cursor-pointer"
              />
              <Input
                ref={inputRef}
                value={hexInput}
                onChange={(e) => handleHexChange(e.target.value)}
                onBlur={handleHexBlur}
                placeholder="#000000"
                className="font-mono text-sm"
                maxLength={7}
              />
            </div>

            {/* Presets */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Cores sugeridas</p>
              <div className="grid grid-cols-6 gap-2">
                {presets.map((color) => (
                  <button
                    key={color}
                    onClick={() => handlePresetClick(color)}
                    className={cn(
                      "h-7 w-7 rounded-md border-2 transition-all hover:scale-110 relative",
                      value.toLowerCase() === color.toLowerCase()
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                    title={color}
                  >
                    {value.toLowerCase() === color.toLowerCase() && (
                      <Check className="h-3.5 w-3.5 text-white absolute inset-0 m-auto drop-shadow-md" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
