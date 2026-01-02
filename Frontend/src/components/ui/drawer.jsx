import * as React from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

const Drawer = ({ open, onOpenChange, children, placement = "left", ...props }) => {
  const [isOpen, setIsOpen] = React.useState(open || false)

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])

  const handleOpenChange = (newOpen) => {
    setIsOpen(newOpen)
    if (onOpenChange) {
      onOpenChange(newOpen)
    }
  }

  if (!isOpen) return null

  const placementClasses = {
    left: "left-0 top-0 bottom-0",
    right: "right-0 top-0 bottom-0",
    top: "top-0 left-0 right-0",
    bottom: "bottom-0 left-0 right-0"
  }

  return (
    <div
      className="fixed inset-0 z-50 flex"
      onClick={() => handleOpenChange(false)}
      {...props}
    >
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => handleOpenChange(false)}
      />
      <div
        className={cn(
          "relative z-50 flex h-full flex-col bg-background shadow-lg",
          placement === "left" && "w-full max-w-sm",
          placement === "right" && "w-full max-w-sm ml-auto",
          placement === "top" && "w-full h-auto max-h-[80vh]",
          placement === "bottom" && "w-full h-auto max-h-[80vh] mt-auto",
          placementClasses[placement],
          props.className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

const DrawerHeader = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col space-y-2 p-6", className)}
    {...props}
  />
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerTitle = ({ className, ...props }) => (
  <div
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
)
DrawerTitle.displayName = "DrawerTitle"

const DrawerDescription = ({ className, ...props }) => (
  <div
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
)
DrawerDescription.displayName = "DrawerDescription"

const DrawerContent = ({ className, children, ...props }) => (
  <div className={cn("flex-1 overflow-y-auto p-6", className)} {...props}>
    {children}
  </div>
)
DrawerContent.displayName = "DrawerContent"

const DrawerClose = ({ className, onClick, ...props }) => (
  <button
    className={cn(
      "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
      className
    )}
    onClick={onClick}
    {...props}
  >
    <X className="h-4 w-4" />
    <span className="sr-only">Close</span>
  </button>
)
DrawerClose.displayName = "DrawerClose"

export {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerContent,
  DrawerClose,
}

