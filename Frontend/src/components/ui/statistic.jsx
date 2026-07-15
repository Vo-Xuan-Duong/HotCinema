import * as React from "react"
import { ArrowDown, ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

const Statistic = ({
  title,
  value,
  prefix,
  suffix,
  valueStyle,
  className,
  ...props
}) => {
  return (
    <div className={cn("flex flex-col", className)} {...props}>
      {title && <div className="mb-1 text-sm text-muted-foreground">{title}</div>}
      <div className="flex items-baseline gap-2">
        {prefix && <span className="text-lg text-muted-foreground">{prefix}</span>}
        <span
          className="text-2xl font-semibold tracking-tight text-foreground"
          style={valueStyle}
        >
          {value}
        </span>
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  )
}

const StatisticCard = ({
  title,
  value,
  prefix,
  suffix,
  icon,
  trend,
  trendValue,
  className,
  ...props
}) => {
  return (
    <Card className={cn("transition-shadow hover:shadow-md", className)} {...props}>
      <CardContent className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-1 text-sm text-muted-foreground">{title}</div>
            <div className="flex items-baseline gap-2">
              {prefix && <span className="text-lg text-muted-foreground">{prefix}</span>}
              <span className="text-3xl font-semibold tracking-tight text-foreground">{value}</span>
              {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
            </div>
          </div>
          {icon && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              {icon}
            </div>
          )}
        </div>
        {trend && trendValue && (
          <div
            className={cn(
              "flex items-center gap-1 text-sm",
              trend === "up" ? "text-emerald-600" : "text-destructive"
            )}
          >
            {trend === "up" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            <span>{trendValue}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { Statistic, StatisticCard }
