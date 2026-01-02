import * as React from "react"
import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button"

const Alert = ({ 
  message,
  description,
  type = "info",
  showIcon = false,
  closable = false,
  onClose,
  className,
  ...props 
}) => {
  const typeConfig = {
    success: {
      icon: <CheckCircle2 className="h-5 w-5" />,
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      iconColor: "text-green-600",
    },
    error: {
      icon: <XCircle className="h-5 w-5" />,
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      iconColor: "text-red-600",
    },
    warning: {
      icon: <AlertCircle className="h-5 w-5" />,
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      iconColor: "text-yellow-600",
    },
    info: {
      icon: <Info className="h-5 w-5" />,
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      iconColor: "text-blue-600",
    },
  }

  const config = typeConfig[type] || typeConfig.info

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        config.bg,
        config.border,
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        {showIcon && (
          <div className={cn("flex-shrink-0 mt-0.5", config.iconColor)}>
            {config.icon}
          </div>
        )}
        <div className="flex-1">
          {message && (
            <div className={cn("font-semibold mb-1", config.text)}>
              {message}
            </div>
          )}
          {description && (
            <div className={cn("text-sm", config.text)}>
              {description}
            </div>
          )}
        </div>
        {closable && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={cn("h-6 w-6 flex-shrink-0", config.text, "hover:bg-transparent")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

export { Alert }


