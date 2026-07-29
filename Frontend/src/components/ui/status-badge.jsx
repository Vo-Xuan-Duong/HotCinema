import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const tones = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  error: "border-destructive/30 bg-destructive/10 text-destructive",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  info: "border-sky-200 bg-sky-50 text-sky-700",
  cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
  blue: "border-sky-200 bg-sky-50 text-sky-700",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  neutral: "border-border bg-secondary text-secondary-foreground",
  default: "border-border bg-secondary text-secondary-foreground",
  orange: "border-orange-200 bg-orange-50 text-orange-700",
  gold: "border-amber-200 bg-amber-50 text-amber-700",
  purple: "border-violet-200 bg-violet-50 text-violet-700",
  pink: "border-pink-200 bg-pink-50 text-pink-700",
  indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",
  teal: "border-teal-200 bg-teal-50 text-teal-700",
  red: "border-red-200 bg-red-50 text-red-700",
}

function StatusBadge({ tone = "neutral", leading, children, className, ...props }) {
  return (
    <Badge
      variant="outline"
      className={cn("inline-flex items-center gap-1", tones[tone] || tones.neutral, className)}
      {...props}
    >
      {leading}
      {children}
    </Badge>
  )
}

export { StatusBadge }
