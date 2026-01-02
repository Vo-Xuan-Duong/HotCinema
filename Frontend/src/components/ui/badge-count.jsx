import * as React from "react"
import { cn } from "../../lib/utils"

const Badge = ({ count, showZero = false, children, className, ...props }) => {
  if (!showZero && (!count || count === 0)) {
    return children
  }

  return (
    <div className="relative inline-block" {...props}>
      {children}
      {count > 0 && (
        <span
          className={cn(
            "absolute -top-2 -right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-primary text-white text-xs font-medium",
            className
          )}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </div>
  )
}

export { Badge }


