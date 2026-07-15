import * as React from "react"
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const Result = ({
  status = "success",
  title,
  subTitle,
  extra,
  icon,
  className,
  ...props
}) => {
  const statusConfig = {
    success: {
      icon: <CheckCircle2 className="h-16 w-16 text-emerald-600" />,
      iconBg: "bg-emerald-50",
    },
    error: {
      icon: <XCircle className="h-16 w-16 text-destructive" />,
      iconBg: "bg-destructive/10",
    },
    info: {
      icon: <Info className="h-16 w-16 text-sky-600" />,
      iconBg: "bg-sky-50",
    },
    warning: {
      icon: <AlertCircle className="h-16 w-16 text-amber-600" />,
      iconBg: "bg-amber-50",
    },
  }

  const config = statusConfig[status] || statusConfig.success

  return (
    <div className={cn("flex flex-col items-center justify-center px-4 py-8", className)} {...props}>
      <div className={cn("mb-4 rounded-full p-4", config.iconBg)}>
        {icon || config.icon}
      </div>
      {title && <h3 className="mb-2 text-xl font-semibold text-foreground">{title}</h3>}
      {subTitle && (
        <div className="mb-6 max-w-md text-center text-sm text-muted-foreground">
          {subTitle}
        </div>
      )}
      {extra && (
        <div className="flex flex-wrap justify-center gap-2">
          {Array.isArray(extra)
            ? extra.map((item, index) => <React.Fragment key={index}>{item}</React.Fragment>)
            : extra}
        </div>
      )}
    </div>
  )
}

export { Result }
