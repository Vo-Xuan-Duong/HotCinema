import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const Tag = ({
  color = "default",
  children,
  className,
  ...props
}) => {
  const colorConfig = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    error: "border-destructive/30 bg-destructive/10 text-destructive",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    info: "border-sky-200 bg-sky-50 text-sky-700",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
    blue: "border-sky-200 bg-sky-50 text-sky-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    default: "border-border bg-secondary text-secondary-foreground",
    orange: "border-orange-200 bg-orange-50 text-orange-700",
    purple: "border-violet-200 bg-violet-50 text-violet-700",
    pink: "border-pink-200 bg-pink-50 text-pink-700",
    indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",
    teal: "border-teal-200 bg-teal-50 text-teal-700",
  }

  return (
    <Badge
      variant="outline"
      className={cn(colorConfig[color] || colorConfig.default, className)}
      {...props}
    >
      {children}
    </Badge>
  )
}

export { Tag }
