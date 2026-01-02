import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./dialog"
import { Button } from "./button"
import { cn } from "../../lib/utils"

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
    <Dialog open={open} onOpenChange={(open) => !open && onCancel?.()}>
      <DialogContent
        className={cn("max-h-[90vh]", className)}
        style={{ width: typeof width === 'number' ? `${width}px` : width, maxWidth: typeof width === 'number' ? `${width}px` : width }}
        {...props}
      >
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        <div className="max-h-[70vh] overflow-y-auto">
          {children}
        </div>
        {footer && (
          <DialogFooter>
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

Modal.confirm = ({ title, content, onOk, onCancel }) => {
  const [open, setOpen] = React.useState(true)

  const handleOk = () => {
    onOk?.()
    setOpen(false)
  }

  const handleCancel = () => {
    onCancel?.()
    setOpen(false)
  }

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      title={title}
      footer={[
        <Button key="cancel" variant="outline" onClick={handleCancel}>
          Hủy
        </Button>,
        <Button key="ok" onClick={handleOk}>
          Xác nhận
        </Button>
      ]}
    >
      <p className="text-gray-600">{content}</p>
    </Modal>
  )
}

export { Modal }

