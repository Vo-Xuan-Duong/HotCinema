import * as React from "react"
import { cn } from "../../lib/utils"
import { ArrowUp, ArrowDown } from "lucide-react"

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
      {title && <div className="text-sm text-gray-600 mb-1">{title}</div>}
      <div className="flex items-baseline gap-2">
        {prefix && <span className="text-lg">{prefix}</span>}
        <span 
          className="text-2xl font-bold text-gray-900"
          style={valueStyle}
        >
          {value}
        </span>
        {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
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
    <div className={cn(
      "bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow",
      className
    )} {...props}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="text-sm text-gray-600 mb-1">{title}</div>
          <div className="flex items-baseline gap-2">
            {prefix && <span className="text-lg text-gray-500">{prefix}</span>}
            <span className="text-3xl font-bold text-gray-900">{value}</span>
            {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
          </div>
        </div>
        {icon && (
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
      </div>
      {trend && trendValue && (
        <div className={cn(
          "flex items-center gap-1 text-sm",
          trend === 'up' ? "text-green-600" : "text-red-600"
        )}>
          {trend === 'up' ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  )
}

export { Statistic, StatisticCard }


