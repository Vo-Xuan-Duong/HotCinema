import * as React from "react"
import { cn } from "../../lib/utils"

const Tag = ({ 
  color = "default",
  children,
  className,
  ...props 
}) => {
  const colorConfig = {
    success: "bg-green-100 text-green-800 border-green-200",
    error: "bg-red-100 text-red-800 border-red-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    info: "bg-blue-100 text-blue-800 border-blue-200",
    cyan: "bg-cyan-100 text-cyan-800 border-cyan-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    green: "bg-green-100 text-green-800 border-green-200",
    default: "bg-gray-100 text-gray-800 border-gray-200",
    orange: "bg-orange-100 text-orange-800 border-orange-200",
    purple: "bg-purple-100 text-purple-800 border-purple-200",
    pink: "bg-pink-100 text-pink-800 border-pink-200",
    indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
    teal: "bg-teal-100 text-teal-800 border-teal-200",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        colorConfig[color] || colorConfig.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export { Tag }


