import { useState } from "react"
import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

function NumberStepper({
  value,
  defaultValue = 0,
  onValueChange,
  min = 0,
  max,
  step = 1,
  disabled = false,
  className,
  name,
  id,
  required,
  placeholder,
  inputClassName,
  inputProps = {},
  ...wrapperProps
}) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const controlled = value !== undefined
  const currentValue = controlled ? value : internalValue

  const clamp = (nextValue) => {
    const parsed = Number(nextValue)
    const safeValue = Number.isFinite(parsed) ? parsed : min
    return Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min ?? Number.NEGATIVE_INFINITY, safeValue))
  }

  const update = (nextValue) => {
    const normalized = clamp(nextValue)
    if (!controlled) setInternalValue(normalized)
    onValueChange?.(normalized)
  }

  return (
    <div className={cn("flex items-center gap-1", className)} {...wrapperProps}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0"
        disabled={disabled || Number(currentValue) <= min}
        onClick={() => update(Number(currentValue) - step)}
      >
        <Minus className="h-4 w-4" />
        <span className="sr-only">Giảm</span>
      </Button>
      <Input
        {...inputProps}
        id={id}
        name={name}
        type="number"
        value={currentValue}
        min={min}
        max={max}
        step={step}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        className={cn("h-8 min-w-0 flex-1 text-center", inputClassName)}
        onChange={(event) => update(event.target.value)}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0"
        disabled={disabled || (max !== undefined && Number(currentValue) >= max)}
        onClick={() => update(Number(currentValue) + step)}
      >
        <Plus className="h-4 w-4" />
        <span className="sr-only">Tăng</span>
      </Button>
    </div>
  )
}

export { NumberStepper }
