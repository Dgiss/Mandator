
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormPreviewProps {
  title: string;
  data: Record<string, any>;
  isValid: boolean;
  className?: string;
  onEdit?: () => void;
}

export function FormPreview({
  title,
  data,
  isValid,
  className,
  onEdit
}: FormPreviewProps) {
  const [expanded, setExpanded] = React.useState(false);
  
  // Function to format values for display
  const formatValue = (value: any) => {
    if (value === null || value === undefined) {
      return "—";
    } else if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    } else if (value instanceof Date) {
      return value.toLocaleDateString();
    } else if (typeof value === "object") {
      return JSON.stringify(value);
    } else {
      return String(value);
    }
  };

  // Filter out empty or null values if not expanded
  const displayData = Object.entries(data).filter(([key, value]) => 
    expanded || (value !== null && value !== undefined && value !== "")
  );

  return (
    <Card className={cn("shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <div className="flex gap-2">
          {onEdit && (
            <Button onClick={onEdit} variant="outline" size="sm">
              Edit
            </Button>
          )}
          <Button
            onClick={() => setExpanded(!expanded)}
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
          >
            {expanded ? (
              <EyeOff className="h-4 w-4 mr-1" />
            ) : (
              <Eye className="h-4 w-4 mr-1" />
            )}
            {expanded ? "Show Less" : "Show All"}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {!isValid && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Form has validation errors</p>
              <p className="text-sm">Please fix the errors before submitting.</p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          {displayData.map(([key, value]) => (
            <div key={key} className="overflow-hidden">
              <dt className="text-sm font-medium text-muted-foreground truncate">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </dt>
              <dd className="mt-1 text-sm font-medium truncate">
                {formatValue(value)}
              </dd>
            </div>
          ))}
        </div>
        
        {!expanded && displayData.length < Object.keys(data).length && (
          <Button
            onClick={() => setExpanded(true)}
            variant="ghost"
            size="sm"
            className="mt-4 text-sm text-muted-foreground"
          >
            Show {Object.keys(data).length - displayData.length} more fields
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
