import * as React from "react"
import { Minus, Plus } from "lucide-react"
import { Button } from "./button"
import { Input } from "./input"
import { cn } from "../../lib/utils"

const InputNumber = ({ 
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  disabled = false,
  className,
  ...props 
}) => {
  const [internalValue, setInternalValue] = React.useState(value || 0)

  React.useEffect(() => {
    setInternalValue(value || 0)
  }, [value])

  const handleChange = (newValue) => {
    let numValue = Number(newValue)
    if (isNaN(numValue)) numValue = min

    if (min !== undefined && numValue < min) numValue = min
    if (max !== undefined && numValue > max) numValue = max

    setInternalValue(numValue)
    onChange?.(numValue)
  }

  const handleDecrease = () => {
    if (disabled) return
    handleChange(internalValue - step)
  }

  const handleIncrease = () => {
    if (disabled) return
    handleChange(internalValue + step)
  }

  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleDecrease}
        disabled={disabled || (min !== undefined && internalValue <= min)}
        className="h-8 w-8"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        value={internalValue}
        onChange={(e) => handleChange(e.target.value)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="w-16 text-center h-8"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleIncrease}
        disabled={disabled || (max !== undefined && internalValue >= max)}
        className="h-8 w-8"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}

export { InputNumber }


