import * as React from "react"
import { CheckCircle2, XCircle, Info, AlertCircle } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button"

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
      icon: <CheckCircle2 className="h-16 w-16 text-green-500" />,
      iconBg: "bg-green-50",
    },
    error: {
      icon: <XCircle className="h-16 w-16 text-red-500" />,
      iconBg: "bg-red-50",
    },
    info: {
      icon: <Info className="h-16 w-16 text-blue-500" />,
      iconBg: "bg-blue-50",
    },
    warning: {
      icon: <AlertCircle className="h-16 w-16 text-yellow-500" />,
      iconBg: "bg-yellow-50",
    },
  }

  const config = statusConfig[status] || statusConfig.success

  return (
    <div
      className={cn("flex flex-col items-center justify-center py-8 px-4", className)}
      {...props}
    >
      <div className={cn("rounded-full p-4 mb-4", config.iconBg)}>
        {icon || config.icon}
      </div>
      {title && (
        <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
      )}
      {subTitle && (
        <div className="text-sm text-gray-600 text-center mb-6 max-w-md">
          {subTitle}
        </div>
      )}
      {extra && (
        <div className="flex gap-2 flex-wrap justify-center">
          {Array.isArray(extra) ? extra.map((item, index) => (
            <React.Fragment key={index}>{item}</React.Fragment>
          )) : extra}
        </div>
      )}
    </div>
  )
}

export { Result }


