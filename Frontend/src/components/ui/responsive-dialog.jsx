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
      className={cn("w-[calc(100vw-2rem)] overflow-hidden p-0 sm:w-full", className)}
      style={{ maxWidth: typeof maxWidth === "number" ? `min(${maxWidth}px, calc(100vw - 2rem))` : maxWidth }}
    >
      {(heading || description) && (
        <DialogHeader className="border-b px-5 py-4 text-left sm:px-6">
          {heading && <DialogTitle>{heading}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
      )}
      <div className="max-h-[calc(100dvh-10rem)] overflow-y-auto px-5 py-4 sm:px-6">{children}</div>
      {actions && <DialogFooter className="border-t px-5 py-4 sm:px-6">{actions}</DialogFooter>}
    </DialogContent>
  </Dialog>
)

export { ResponsiveDialog }
