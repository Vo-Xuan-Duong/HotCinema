import * as React from "react"
import { cn } from "@/lib/utils"

const BadgeRibbon = ({ 
  text,
  color = "default",
  placement = "end",
  children,
  className,
  ...props 
}) => {
  const colorConfig = {
    blue: "bg-blue-500",
    red: "bg-red-500",
    green: "bg-green-500",
    orange: "bg-orange-500",
    purple: "bg-purple-500",
    volcano: "bg-orange-600",
    default: "bg-gray-500",
  }

  const bgColor = colorConfig[color] || colorConfig.default

  return (
    <div className={cn("relative", className)} {...props}>
      {children}
      <div
        className={cn(
          "absolute top-0 z-10 px-2 py-1 text-xs font-semibold text-white shadow-lg",
          bgColor,
          placement === "start" ? "left-0" : "right-0",
          placement === "start" 
            ? "clip-path-[polygon(0_0,100%_0,100%_100%,0_100%,8px_50%)]" 
            : "clip-path-[polygon(0_0,calc(100%-8px)_50%,100%_100%,0_100%)]"
        )}
        style={{
          clipPath: placement === "start" 
            ? "polygon(0 0, 100% 0, 100% 100%, 0 100%, 8px 50%)"
            : "polygon(0 0, calc(100% - 8px) 50%, 100% 100%, 0 100%)"
        }}
      >
        {text}
      </div>
    </div>
  )
}

export { BadgeRibbon }


