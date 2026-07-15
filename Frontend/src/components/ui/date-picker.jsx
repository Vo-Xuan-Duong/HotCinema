import * as React from "react"
import dayjs from "dayjs"
import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const DatePicker = ({
  value,
  onChange,
  format = "DD/MM/YYYY",
  placeholder = "Chọn ngày",
  className,
  ...props
}) => {
  const [open, setOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState(value ? dayjs(value) : null)

  React.useEffect(() => {
    setSelectedDate(value ? dayjs(value) : null)
  }, [value])

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    onChange?.(date)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground", className)}
          {...props}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {selectedDate ? selectedDate.format(format) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <Input
          type="date"
          value={selectedDate ? selectedDate.format("YYYY-MM-DD") : ""}
          onChange={(event) => {
            if (event.target.value) {
              handleDateSelect(dayjs(event.target.value))
            }
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

const RangePicker = ({
  value,
  onChange,
  format = "DD/MM/YYYY",
  allowClear = true,
  className,
  ...props
}) => {
  const [open, setOpen] = React.useState(false)
  const [startDate, setStartDate] = React.useState(value?.[0] ? dayjs(value[0]) : null)
  const [endDate, setEndDate] = React.useState(value?.[1] ? dayjs(value[1]) : null)

  React.useEffect(() => {
    setStartDate(value?.[0] ? dayjs(value[0]) : null)
    setEndDate(value?.[1] ? dayjs(value[1]) : null)
  }, [value])

  const handleStartDateChange = (date) => {
    setStartDate(date)
    if (date && endDate && date.isAfter(endDate)) {
      setEndDate(null)
      onChange?.([date, null])
    } else if (date && endDate) {
      onChange?.([date, endDate])
    } else {
      onChange?.([date, null])
    }
  }

  const handleEndDateChange = (date) => {
    setEndDate(date)
    if (startDate && date) {
      onChange?.([startDate, date])
      setOpen(false)
    }
  }

  const displayValue = startDate && endDate
    ? `${startDate.format(format)} - ${endDate.format(format)}`
    : startDate
      ? `${startDate.format(format)} - ...`
      : "Chọn khoảng thời gian"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", !startDate && !endDate && "text-muted-foreground", className)}
          {...props}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Từ ngày</label>
            <Input
              type="date"
              value={startDate ? startDate.format("YYYY-MM-DD") : ""}
              onChange={(event) => {
                if (event.target.value) {
                  handleStartDateChange(dayjs(event.target.value))
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Đến ngày</label>
            <Input
              type="date"
              value={endDate ? endDate.format("YYYY-MM-DD") : ""}
              onChange={(event) => {
                if (event.target.value) {
                  handleEndDateChange(dayjs(event.target.value))
                }
              }}
              min={startDate ? startDate.format("YYYY-MM-DD") : undefined}
            />
          </div>
          {allowClear && (startDate || endDate) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStartDate(null)
                setEndDate(null)
                onChange?.(null)
              }}
              className="w-full"
            >
              Xóa
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker, RangePicker }
