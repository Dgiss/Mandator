
import React, { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';

interface EditableFieldProps {
  value: string | number;
  onSave: (value: string | number) => void;
  type?: 'text' | 'number' | 'textarea';
  className?: string;
  placeholder?: string;
  showEditIcon?: boolean;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  value,
  onSave,
  type = 'text',
  className = '',
  placeholder = 'Editer...',
  showEditIcon = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState<string | number>(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      
      if ('select' in inputRef.current) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setCurrentValue(val);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onSave(currentValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && type !== 'textarea') {
      setIsEditing(false);
      onSave(currentValue);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setCurrentValue(value);
    }
  };

  const renderEditIcon = () => {
    if (!showEditIcon) return null;
    
    return (
      <Pencil 
        className="h-3.5 w-3.5 ml-1.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" 
      />
    );
  };

  if (isEditing) {
    if (type === 'textarea') {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={currentValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`w-full border rounded px-2 py-1 ${className}`}
          placeholder={placeholder}
          rows={3}
        />
      );
    }
    
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={type}
        value={currentValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`border rounded px-2 py-1 ${className}`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <span 
      onDoubleClick={handleDoubleClick} 
      onClick={() => showEditIcon && setIsEditing(true)}
      className={`cursor-text group inline-flex items-center ${className}`}
    >
      {value || placeholder}
      {renderEditIcon()}
    </span>
  );
};
