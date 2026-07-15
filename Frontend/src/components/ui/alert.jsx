import * as React from "react"
import { cva } from "class-variance-authority"
import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 text-sm",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        success: "border-emerald-200 bg-emerald-50 text-emerald-950",
        destructive: "border-destructive/30 bg-destructive text-destructive-foreground",
        warning: "border-amber-200 bg-amber-50 text-amber-950",
        info: "border-sky-200 bg-sky-50 text-sky-950",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  destructive: XCircle,
  warning: AlertCircle,
  info: Info,
  default: Info,
}

const Alert = ({
  message,
  description,
  type = "info",
  variant,
  showIcon = false,
  closable = false,
  onClose,
  className,
  children,
  ...props
}) => {
  const actualVariant = variant || (type === "error" ? "destructive" : type)
  const Icon = iconMap[type] || iconMap[actualVariant] || iconMap.default

  return (
    <div className={cn(alertVariants({ variant: actualVariant }), className)} {...props}>
      <div className="flex items-start gap-3">
        {showIcon && <Icon className="mt-0.5 h-4 w-4 shrink-0" />}
        <div className="min-w-0 flex-1">
          {message && <div className="mb-1 font-medium leading-none tracking-tight">{message}</div>}
          {description && <div className="text-sm opacity-90">{description}</div>}
          {children}
        </div>
        {closable && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6 shrink-0 opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

export { Alert, alertVariants }
