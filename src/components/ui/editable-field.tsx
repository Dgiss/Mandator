
import React, { useState } from 'react';
import { Edit } from 'lucide-react';

interface EditableFieldProps {
  value: string | number;
  onSave: (value: string | number) => void;
  className?: string;
  type?: "text" | "number" | "textarea" | "date"; // Ajout du type "date"
  showEditIcon?: boolean;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  value,
  onSave,
  className = "",
  type = "text",
  showEditIcon = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string | number>(value);

  const handleEdit = () => {
    setEditValue(value);
    setIsEditing(true);
  };

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'textarea') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (type === 'number') {
      setEditValue(val === '' ? '' : Number(val));
    } else {
      setEditValue(val);
    }
  };

  if (isEditing) {
    if (type === 'textarea') {
      return (
        <div className={`inline-flex flex-col ${className}`}>
          <textarea
            value={editValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="p-1 border rounded"
            autoFocus
          />
          <div className="flex justify-end mt-1 space-x-1">
            <button
              onClick={handleSave}
              className="px-2 py-0.5 text-xs bg-green-500 text-white rounded hover:bg-green-600"
            >
              Enregistrer
            </button>
            <button
              onClick={handleCancel}
              className="px-2 py-0.5 text-xs border rounded hover:bg-gray-100"
            >
              Annuler
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={`inline-flex items-center ${className}`}>
        <input
          type={type === "date" ? "date" : type === "number" ? "number" : "text"}
          value={type === "date" && typeof editValue === "string" ? editValue : editValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="p-1 border rounded"
          autoFocus
        />
        <button
          onClick={handleSave}
          className="ml-1 p-1 text-green-500 hover:text-green-700"
        >
          ✓
        </button>
        <button
          onClick={handleCancel}
          className="p-1 text-red-500 hover:text-red-700"
        >
          ✗
        </button>
      </div>
    );
  }

  return (
    <span
      className={`cursor-pointer hover:bg-gray-100 rounded px-1 ${className}`}
      onClick={handleEdit}
    >
      {value}
      {showEditIcon && (
        <Edit className="h-3 w-3 inline-block ml-1 text-muted-foreground" />
      )}
    </span>
  );
};
