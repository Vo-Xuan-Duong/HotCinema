import * as React from "react"
import { cn } from "../../lib/utils"

const List = ({ dataSource = [], renderItem, className, ...props }) => {
  return (
    <div className={cn("divide-y", className)} {...props}>
      {dataSource.map((item, index) => (
        <div key={item.id || index}>
          {renderItem ? renderItem(item, index) : null}
        </div>
      ))}
    </div>
  )
}

const ListItem = ({ 
  children, 
  actions,
  className,
  ...props 
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 hover:bg-gray-50 transition-colors",
        className
      )}
      {...props}
    >
      <div className="flex-1">{children}</div>
      {actions && (
        <div className="flex items-center gap-2 ml-4">
          {actions}
        </div>
      )}
    </div>
  )
}

const ListItemMeta = ({ avatar, title, description, className, ...props }) => {
  return (
    <div className={cn("flex items-start gap-3", className)} {...props}>
      {avatar && <div className="flex-shrink-0">{avatar}</div>}
      <div className="flex-1 min-w-0">
        {title && <div className="font-medium text-sm mb-1">{title}</div>}
        {description && <div className="text-xs text-gray-500">{description}</div>}
      </div>
    </div>
  )
}

ListItem.Meta = ListItemMeta

export { List, ListItem }


