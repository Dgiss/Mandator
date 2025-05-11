
import * as React from "react";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import useFormOperations from "@/hooks/form/use-form-operations";
import { Button } from "@/components/ui/button";
import { Save, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedFormProps<T extends Record<string, any>> {
  defaultValues: T;
  validationConfig?: any;
  onSubmit: (data: T) => Promise<void> | void;
  className?: string;
  children: React.ReactNode;
  submitLabel?: string;
  enableAutoSave?: boolean;
  showPreview?: boolean;
  submitButtonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive" | "btpPrimary";
  draftKey?: string;
  showCancelButton?: boolean;
  onCancel?: () => void;
  cancelLabel?: string;
}

export function EnhancedForm<T extends Record<string, any>>({
  defaultValues,
  validationConfig,
  onSubmit,
  className,
  children,
  submitLabel = "Submit",
  enableAutoSave = false,
  showPreview = false,
  submitButtonVariant = "default",
  draftKey,
  showCancelButton = false,
  onCancel,
  cancelLabel = "Cancel"
}: EnhancedFormProps<T>) {
  const { toast } = useToast();
  const [autoSaveStatus, setAutoSaveStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle");
  const autoSaveTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Load draft from localStorage if it exists and if draftKey is provided
  React.useEffect(() => {
    if (draftKey) {
      try {
        const savedDraft = localStorage.getItem(`form_draft_${draftKey}`);
        if (savedDraft) {
          const parsedDraft = JSON.parse(savedDraft);
          // Merge parsed draft with default values to ensure all required fields exist
          const mergedValues = { ...defaultValues, ...parsedDraft };
          setFormValues(mergedValues);
          toast({
            title: "Draft loaded",
            description: "Your previous draft has been restored.",
            variant: "default",
          });
        }
      } catch (error) {
        console.error("Failed to load draft:", error);
      }
    }
  }, [draftKey]);

  // Initialize form with the form operations hook
  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    setFieldValue,
    resetForm,
    formRef,
    isSubmitting,
    isDirty,
    setValues: setFormValues
  } = useFormOperations(defaultValues, validationConfig);

  // Auto-save functionality
  React.useEffect(() => {
    if (enableAutoSave && isDirty && draftKey) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      setAutoSaveStatus("saving");
      
      autoSaveTimerRef.current = setTimeout(() => {
        try {
          localStorage.setItem(`form_draft_${draftKey}`, JSON.stringify(values));
          setAutoSaveStatus("saved");
          
          // Reset to idle after showing "saved" for a moment
          setTimeout(() => {
            setAutoSaveStatus("idle");
          }, 2000);
        } catch (error) {
          console.error("Failed to auto-save form:", error);
          setAutoSaveStatus("error");
        }
      }, 2000); // Auto-save after 2 seconds of inactivity
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [values, isDirty, enableAutoSave, draftKey]);

  // Clear draft on successful submit
  const handleFormSubmit = async (data: T) => {
    try {
      await onSubmit(data);
      if (draftKey) {
        localStorage.removeItem(`form_draft_${draftKey}`);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: "Failed to submit the form. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn("space-y-8", className)}>
      <form
        ref={formRef}
        className="space-y-6"
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        {children}

        <div className="flex justify-between items-center mt-8">
          <div className="flex items-center text-sm">
            {autoSaveStatus === "saving" && (
              <span className="text-muted-foreground flex items-center">
                <Save className="w-4 h-4 mr-1 animate-pulse" />
                Saving draft...
              </span>
            )}
            {autoSaveStatus === "saved" && (
              <span className="text-green-500 flex items-center">
                <Save className="w-4 h-4 mr-1" />
                Draft saved
              </span>
            )}
            {autoSaveStatus === "error" && (
              <span className="text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                Failed to save draft
              </span>
            )}
          </div>

          <div className="flex gap-3">
            {showCancelButton && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
              >
                {cancelLabel}
              </Button>
            )}
            <Button 
              type="submit" 
              variant={submitButtonVariant} 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : submitLabel}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export { useFormOperations };
