import * as React from "react"
import { cn } from "../../lib/utils"

const Descriptions = ({ 
  column = 2,
  items = [],
  children,
  className,
  ...props 
}) => {
  const columnClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-3",
  }

  return (
    <dl className={cn("grid gap-4", columnClass[column] || columnClass[2], className)} {...props}>
      {items.length > 0 ? (
        items.map((item, index) => (
          <React.Fragment key={index}>
            <dt className="text-sm font-medium text-gray-500">{item.label}</dt>
            <dd className="text-sm text-gray-900">{item.children}</dd>
          </React.Fragment>
        ))
      ) : (
        children
      )}
    </dl>
  )
}

const DescriptionsItem = ({ label, children, span = 1, ...props }) => {
  return (
    <>
      <dt className="text-sm font-medium text-gray-500" {...props}>{label}</dt>
      <dd className="text-sm text-gray-900" style={{ gridColumn: span > 1 ? `span ${span}` : undefined }}>
        {children}
      </dd>
    </>
  )
}

Descriptions.Item = DescriptionsItem

export { Descriptions }


