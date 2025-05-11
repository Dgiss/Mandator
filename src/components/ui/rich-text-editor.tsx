
import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Bold, Italic, Underline, List, ListOrdered, Heading2, Link as LinkIcon } from "lucide-react";

interface RichTextEditorProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export function RichTextEditor({
  id,
  label,
  value,
  onChange,
  description,
  placeholder,
  error,
  required,
  className
}: RichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const formatDoc = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value);
    handleContentChange();
    editorRef.current?.focus();
  };

  const handleButtonClick = (command: string, value: string | null = null) => (e: React.MouseEvent) => {
    e.preventDefault();
    formatDoc(command, value);
  };

  const handleLinkInsert = () => {
    const url = prompt("Enter URL:", "http://");
    if (url) {
      formatDoc("createLink", url);
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
      
      <div className="border rounded-md overflow-hidden">
        <div className="bg-muted p-1 border-b flex flex-wrap gap-1">
          <button
            type="button"
            className="p-1 hover:bg-background rounded-sm"
            title="Bold"
            onClick={handleButtonClick("bold")}
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="p-1 hover:bg-background rounded-sm"
            title="Italic"
            onClick={handleButtonClick("italic")}
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="p-1 hover:bg-background rounded-sm"
            title="Underline"
            onClick={handleButtonClick("underline")}
          >
            <Underline className="h-4 w-4" />
          </button>
          <div className="w-px h-6 bg-border mx-1 self-center" />
          <button
            type="button"
            className="p-1 hover:bg-background rounded-sm"
            title="Bullet List"
            onClick={handleButtonClick("insertUnorderedList")}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="p-1 hover:bg-background rounded-sm"
            title="Numbered List"
            onClick={handleButtonClick("insertOrderedList")}
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <div className="w-px h-6 bg-border mx-1 self-center" />
          <button
            type="button"
            className="p-1 hover:bg-background rounded-sm"
            title="Heading"
            onClick={handleButtonClick("formatBlock", "h2")}
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="p-1 hover:bg-background rounded-sm"
            title="Link"
            onClick={() => handleLinkInsert()}
          >
            <LinkIcon className="h-4 w-4" />
          </button>
        </div>
        
        <div
          ref={editorRef}
          id={id}
          className="min-h-[200px] p-3 focus:outline-none"
          contentEditable
          onInput={handleContentChange}
          onBlur={handleContentChange}
          data-placeholder={placeholder}
          dangerouslySetInnerHTML={{ __html: value }}
        />
      </div>
      
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}
