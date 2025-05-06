
import React from 'react'

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-btp-navy">{title}</h1>
        {description && <p className="text-btp-gray mt-1">{description}</p>}
      </div>
      {children && <div className="flex space-x-3 mt-2 md:mt-0">{children}</div>}
    </div>
  )
}
