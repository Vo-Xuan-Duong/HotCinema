import * as React from "react"
import { cn } from "@/lib/utils"

const Sidebar = ({ children, className, ...props }) => {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card text-card-foreground shadow-sm",
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
      className={cn("flex h-16 items-center justify-center border-b p-4", className)}
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
