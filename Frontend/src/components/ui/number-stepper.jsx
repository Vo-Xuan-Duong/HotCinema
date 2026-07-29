import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

function NumberStepper({
  value = 0,
  onValueChange,
  min = 0,
  max,
  step = 1,
  disabled = false,
  className,
  ...props
}) {
  const clamp = (nextValue) => {
    const parsed = Number(nextValue)
    const safeValue = Number.isFinite(parsed) ? parsed : min
    return Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min ?? Number.NEGATIVE_INFINITY, safeValue))
  }
  const update = (nextValue) => onValueChange?.(clamp(nextValue))

  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      <Button type="button" variant="outline" size="icon" className="h-8 w-8" disabled={disabled || value <= min} onClick={() => update(value - step)}>
        <Minus className="h-4 w-4" />
        <span className="sr-only">Giảm</span>
      </Button>
      <Input type="number" value={value} min={min} max={max} step={step} disabled={disabled} className="h-8 w-20 text-center" onChange={(event) => update(event.target.value)} />
      <Button type="button" variant="outline" size="icon" className="h-8 w-8" disabled={disabled || (max !== undefined && value >= max)} onClick={() => update(value + step)}>
        <Plus className="h-4 w-4" />
        <span className="sr-only">Tăng</span>
      </Button>
    </div>
  )
}

export { NumberStepper }
