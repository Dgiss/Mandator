
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

export interface Column {
  id: string;
  header: string;
  accessorKey: string;
  isEditable: boolean;
  type?: 'text' | 'number' | 'select';
  options?: string[];
}

interface Action {
  icon: React.ReactNode;
  label: string;
  onClick: (rowIndex: number) => void;
}

interface EditableTableProps {
  data: any[];
  columns: Column[];
  onUpdate: (rowIndex: number, columnId: string, value: any) => void;
  onDelete?: (rowIndex: number) => void;
  onAdd?: () => void;
  sortable?: boolean;
  actions?: Action[];
}

export const EditableTable: React.FC<EditableTableProps> = ({
  data,
  columns,
  onUpdate,
  onDelete,
  onAdd,
  sortable = false,
  actions = []
}) => {
  const [sortConfig, setSortConfig] = React.useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Function to handle sorting
  const handleSort = (key: string) => {
    if (!sortable) return;
    
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sorted data
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;
    
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  // Function to render editable cell
  const renderEditableCell = (rowIndex: number, column: Column, value: any) => {
    if (!column.isEditable) {
      return value;
    }

    if (column.type === 'select' && column.options) {
      return (
        <select
          value={value}
          onChange={(e) => onUpdate(rowIndex, column.id, e.target.value)}
          className="bg-transparent border-none focus:outline-none p-0 m-0 w-full"
        >
          {column.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={column.type || 'text'}
        value={value}
        onChange={(e) => onUpdate(rowIndex, column.id, e.target.value)}
        className="bg-transparent border-none focus:outline-none p-0 m-0 w-full"
      />
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            {columns.map((column) => (
              <th
                key={column.id}
                className={`px-4 py-2 text-left text-sm font-medium text-gray-600 ${
                  sortable ? 'cursor-pointer' : ''
                }`}
                onClick={() => sortable && handleSort(column.accessorKey)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.header}</span>
                  {sortable && sortConfig && sortConfig.key === column.accessorKey && (
                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
            ))}
            {(onDelete || actions.length > 0) && (
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t hover:bg-gray-50">
              {columns.map((column) => (
                <td key={column.id} className="px-4 py-2 text-sm">
                  {renderEditableCell(
                    rowIndex,
                    column,
                    row[column.accessorKey]
                  )}
                </td>
              ))}
              {(onDelete || actions.length > 0) && (
                <td className="px-4 py-2 text-right">
                  <div className="flex justify-end space-x-2">
                    {actions.map((action, actionIndex) => (
                      <button
                        key={actionIndex}
                        onClick={() => action.onClick(rowIndex)}
                        className="text-gray-500 hover:text-gray-700 p-1"
                        title={action.label}
                      >
                        {action.icon}
                      </button>
                    ))}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(rowIndex)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {onAdd && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onAdd}
            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Ajouter
          </button>
        </div>
      )}
    </div>
  );
};
