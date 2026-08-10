import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const ResponsiveDialog = ({
  open,
  onClose,
  heading,
  description,
  children,
  actions,
  maxWidth = 520,
  className,
}) => (
  <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose?.()}>
    <DialogContent
      className={cn("w-[calc(100vw-1.5rem)] overflow-hidden p-0 sm:w-full", className)}
      style={{ maxWidth: typeof maxWidth === "number" ? `min(${maxWidth}px, calc(100vw - 1.5rem))` : maxWidth }}
    >
      {(heading || description) && (
        <DialogHeader className="border-b px-4 py-3 text-left">
          {heading && <DialogTitle>{heading}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
      )}
      <div className="max-h-[calc(100dvh-8rem)] overflow-y-auto px-4 py-3">{children}</div>
      {actions && <DialogFooter className="border-t px-4 py-3">{actions}</DialogFooter>}
    </DialogContent>
  </Dialog>
)

export { ResponsiveDialog }