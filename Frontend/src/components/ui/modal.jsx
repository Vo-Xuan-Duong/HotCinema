import * as React from "react"
import { createRoot } from "react-dom/client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const Modal = ({
  open,
  onCancel,
  title,
  description,
  children,
  footer,
  width = 520,
  className,
  ...props
}) => {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel?.()}>
      <DialogContent
        className={cn("max-h-[90vh]", className)}
        style={{
          width: typeof width === "number" ? `${width}px` : width,
          maxWidth: typeof width === "number" ? `${width}px` : width,
        }}
        {...props}
      >
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        <div className="max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  )
}

const ConfirmDialog = ({
  title,
  content,
  okText = "Xác nhận",
  cancelText = "Hủy",
  onOk,
  onCancel,
  onDone,
}) => {
  const [open, setOpen] = React.useState(true)

  const close = () => setOpen(false)

  const handleOk = () => {
    onOk?.()
    close()
  }

  const handleCancel = () => {
    onCancel?.()
    close()
  }

  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => !nextOpen && close()}>
      <AlertDialogContent onAnimationEnd={() => !open && onDone?.()}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {content && <AlertDialogDescription>{content}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction onClick={handleOk}>{okText}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

Modal.confirm = (options) => {
  const host = document.createElement("div")
  document.body.appendChild(host)
  const root = createRoot(host)

  const cleanup = () => {
    root.unmount()
    host.remove()
  }

  root.render(<ConfirmDialog {...options} onDone={cleanup} />)

  return {
    destroy: cleanup,
  }
}

export { Modal }
