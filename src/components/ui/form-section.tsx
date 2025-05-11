
import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  defaultExpanded?: boolean;
  collapsible?: boolean;
}

export function FormSection({
  title,
  description,
  children,
  className,
  defaultExpanded = true,
  collapsible = false
}: FormSectionProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  const toggleExpanded = () => {
    if (collapsible) {
      setExpanded(!expanded);
    }
  };

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <div 
        className={cn(
          "bg-muted px-4 py-3 flex items-center justify-between",
          collapsible && "cursor-pointer"
        )}
        onClick={toggleExpanded}
      >
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {collapsible && (
          <div>
            {expanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        )}
      </div>
      
      {expanded && (
        <div className="p-4 bg-background">{children}</div>
      )}
    </div>
  );
}
