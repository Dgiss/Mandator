
import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InfoIcon, ChevronUp, ChevronDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VersionInputProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export function VersionInput({
  id,
  label,
  value,
  onChange,
  description,
  error,
  required,
  className,
}: VersionInputProps) {
  // Parse the version string into components
  const parseVersion = (versionStr: string) => {
    const match = versionStr.match(/^(\d+)\.(\d+)\.(\d+)$/);
    if (match) {
      return {
        major: parseInt(match[1], 10),
        minor: parseInt(match[2], 10),
        patch: parseInt(match[3], 10),
      };
    }
    return { major: 1, minor: 0, patch: 0 };
  };

  // Format components back into a version string
  const formatVersion = (major: number, minor: number, patch: number) => {
    return `${major}.${minor}.${patch}`;
  };

  const { major, minor, patch } = parseVersion(value || "1.0.0");

  const updateVersion = (type: "major" | "minor" | "patch", increment: boolean) => {
    const newVersion = { major, minor, patch };
    
    if (increment) {
      newVersion[type] += 1;
      
      // Reset lower parts when incrementing higher parts
      if (type === "major") {
        newVersion.minor = 0;
        newVersion.patch = 0;
      } else if (type === "minor") {
        newVersion.patch = 0;
      }
    } else if (newVersion[type] > 0) {
      newVersion[type] -= 1;
    }
    
    onChange(formatVersion(newVersion.major, newVersion.minor, newVersion.patch));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow direct input but enforce the format
    const inputValue = e.target.value;
    if (/^\d+\.\d+\.\d+$/.test(inputValue)) {
      onChange(inputValue);
    } else if (/^\d+\.\d+$/.test(inputValue)) {
      onChange(`${inputValue}.0`);
    } else if (/^\d+$/.test(inputValue)) {
      onChange(`${inputValue}.0.0`);
    } else if (inputValue === "") {
      onChange("1.0.0");
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center">
        {label && (
          <Label htmlFor={id} className={cn("mr-2", error && "text-destructive")}>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoIcon className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Version format: major.minor.patch</p>
              <p className="text-xs">Major: Breaking changes</p>
              <p className="text-xs">Minor: New features</p>
              <p className="text-xs">Patch: Bug fixes</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex gap-2">
        <div className="flex flex-col items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => updateVersion("major", true)}
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
          <div className="text-center">
            <Input
              id={`${id}-major`}
              value={major.toString()}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 0) {
                  onChange(formatVersion(val, minor, patch));
                }
              }}
              className={cn(
                "w-12 text-center p-1",
                error && "border-destructive"
              )}
            />
            <span className="text-xs text-muted-foreground">Major</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => updateVersion("major", false)}
            disabled={major <= 0}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="flex items-center font-bold">.</div>
        
        <div className="flex flex-col items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => updateVersion("minor", true)}
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
          <div className="text-center">
            <Input
              id={`${id}-minor`}
              value={minor.toString()}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 0) {
                  onChange(formatVersion(major, val, patch));
                }
              }}
              className={cn(
                "w-12 text-center p-1",
                error && "border-destructive"
              )}
            />
            <span className="text-xs text-muted-foreground">Minor</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => updateVersion("minor", false)}
            disabled={minor <= 0}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="flex items-center font-bold">.</div>
        
        <div className="flex flex-col items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => updateVersion("patch", true)}
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
          <div className="text-center">
            <Input
              id={`${id}-patch`}
              value={patch.toString()}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 0) {
                  onChange(formatVersion(major, minor, val));
                }
              }}
              className={cn(
                "w-12 text-center p-1",
                error && "border-destructive"
              )}
            />
            <span className="text-xs text-muted-foreground">Patch</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => updateVersion("patch", false)}
            disabled={patch <= 0}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <Input
        id={id}
        value={value}
        onChange={handleInputChange}
        className={cn(
          "hidden", // We hide this as we're using the specialized inputs above
          error && "border-destructive"
        )}
      />
      
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}
