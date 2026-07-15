import * as React from "react"
import { cn } from "@/lib/utils"

const Sidebar = ({ children, className, ...props }) => {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 z-50 flex flex-col bg-white border-r border-gray-200 shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  )
}

const SidebarHeader = ({ children, className, ...props }) => {
  return (
    <div
      className={cn("flex items-center justify-center h-16 p-4 border-b border-gray-200", className)}
      {...props}
    >
      {children}
    </div>
  )
}

const SidebarContent = ({ children, className, ...props }) => {
  return (
    <div
      className={cn("flex-1 overflow-y-auto overflow-x-hidden", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Sidebar, SidebarHeader, SidebarContent }


