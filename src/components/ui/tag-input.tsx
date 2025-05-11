
import * as React from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TagInputProps {
  id: string;
  label?: string;
  placeholder?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  maxTags?: number;
}

export function TagInput({
  id,
  label,
  placeholder = "Add tag...",
  tags,
  onChange,
  description,
  error,
  required,
  className,
  maxTags = 10
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      onChange([...tags, trimmedTag]);
      setInputValue("");
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={id} className={cn(error && "text-destructive")}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <div
        className={cn(
          "flex flex-wrap gap-2 p-2 border rounded-md min-h-10",
          tags.length > 0 && "pb-1",
          error ? "border-destructive" : "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        )}
        onClick={handleContainerClick}
      >
        {tags.map((tag, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1 py-1">
            {tag}
            <X
              className="h-3 w-3 cursor-pointer hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(index);
              }}
            />
          </Badge>
        ))}
        
        <Input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          placeholder={tags.length === 0 ? placeholder : ""}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => inputValue && addTag(inputValue)}
          className="flex-1 min-w-[120px] border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-7"
        />
      </div>
      
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      
      {maxTags && (
        <p className="text-xs text-muted-foreground">
          {tags.length}/{maxTags} tags
        </p>
      )}
    </div>
  );
}
