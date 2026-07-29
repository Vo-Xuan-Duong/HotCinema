import * as React from "react"
import { ArrowDown, ArrowUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const Metric = ({
  label,
  value,
  leading,
  trailing,
  valueClassName,
  valueCss,
  className,
}) => (
  <div className={cn("space-y-1", className)}>
    {label && <p className="text-sm text-muted-foreground">{label}</p>}
    <div className="flex min-w-0 items-baseline gap-2">
      {leading && <span className="shrink-0 text-muted-foreground">{leading}</span>}
      <p className={cn("truncate text-2xl font-semibold tracking-tight", valueClassName)} style={valueCss}>{value}</p>
      {trailing && <span className="shrink-0 text-sm text-muted-foreground">{trailing}</span>}
    </div>
  </div>
)

const MetricCard = ({
  label,
  value,
  leading,
  trailing,
  icon,
  trend,
  trendValue,
  valueClassName,
  className,
}) => (
  <Card className={cn("transition-shadow hover:shadow-md", className)}>
    <CardContent className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <Metric label={label} value={value} leading={leading} trailing={trailing} valueClassName={valueClassName} />
        {icon && <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div>}
      </div>
      {trend && trendValue && (
        <p className={cn("mt-3 flex items-center gap-1 text-sm", trend === "up" ? "text-emerald-600" : "text-destructive")}>
          {trend === "up" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          {trendValue}
        </p>
      )}
    </CardContent>
  </Card>
)

export { Metric, MetricCard }
