import * as React from "react"
import { cn } from "../../lib/utils"

const Progress = ({ 
  percent = 0,
  status = "normal",
  showInfo = true,
  strokeColor,
  className,
  ...props 
}) => {
  const statusColors = {
    success: "bg-green-500",
    exception: "bg-red-500",
    active: "bg-blue-500",
    normal: strokeColor || "bg-primary",
  }

  const color = statusColors[status] || statusColors.normal

  return (
    <div className={cn("w-full", className)} {...props}>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={cn("h-full transition-all duration-300 rounded-full", color)}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
      {showInfo && (
        <div className="mt-1 text-sm text-gray-600 text-right">
          {percent.toFixed(0)}%
        </div>
      )}
    </div>
  )
}

export { Progress }


