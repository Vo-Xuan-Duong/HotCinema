import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "../../lib/utils"

const Rate = ({ 
  value = 0, 
  max = 5, 
  allowHalf = false,
  disabled = false,
  onChange,
  className,
  ...props 
}) => {
  const [hoverValue, setHoverValue] = React.useState(0)
  const [internalValue, setInternalValue] = React.useState(value)

  React.useEffect(() => {
    setInternalValue(value)
  }, [value])

  const displayValue = hoverValue || internalValue

  const handleClick = (newValue) => {
    if (disabled) return
    setInternalValue(newValue)
    onChange?.(newValue)
  }

  const handleMouseEnter = (newValue) => {
    if (disabled) return
    setHoverValue(newValue)
  }

  const handleMouseLeave = () => {
    if (disabled) return
    setHoverValue(0)
  }

  return (
    <div 
      className={cn("flex items-center gap-1", className)}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {Array.from({ length: max }).map((_, index) => {
        const starValue = index + 1
        const isFilled = starValue <= displayValue
        const isHalf = allowHalf && displayValue > index && displayValue < starValue

        return (
          <Star
            key={index}
            className={cn(
              "h-5 w-5 transition-colors cursor-pointer",
              isFilled ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
              disabled && "cursor-not-allowed opacity-50"
            )}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
          />
        )
      })}
    </div>
  )
}

export { Rate }


