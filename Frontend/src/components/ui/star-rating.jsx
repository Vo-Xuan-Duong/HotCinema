import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

function StarRating({
  value = 0,
  stars = 5,
  precision = 1,
  readOnly = false,
  onValueChange,
  className,
  ...props
}) {
  const [hoveredValue, setHoveredValue] = React.useState(null)
  const shownValue = hoveredValue ?? value

  const choose = (nextValue) => {
    if (!readOnly) onValueChange?.(nextValue)
  }

  return (
    <div
      role={readOnly ? "img" : "radiogroup"}
      aria-label={`${value} trên ${stars} sao`}
      className={cn("flex items-center gap-1", className)}
      onMouseLeave={() => setHoveredValue(null)}
      {...props}
    >
      {Array.from({ length: stars }, (_, index) => {
        const starValue = index + 1
        const filled = shownValue >= starValue
        const partiallyFilled = precision < 1 && shownValue > index && shownValue < starValue

        return (
          <button
            key={starValue}
            type="button"
            role={readOnly ? undefined : "radio"}
            aria-checked={readOnly ? undefined : value === starValue}
            aria-label={`${starValue} sao`}
            disabled={readOnly}
            className="relative rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:opacity-100"
            onClick={() => choose(starValue)}
            onMouseEnter={() => !readOnly && setHoveredValue(starValue)}
          >
            <Star className={cn("h-5 w-5", filled || partiallyFilled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/35")} />
          </button>
        )
      })}
    </div>
  )
}

export { StarRating }
