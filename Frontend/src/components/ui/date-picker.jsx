import * as React from "react"
import { Calendar } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import dayjs from "dayjs"

const DatePicker = ({ value, onChange, format = "DD/MM/YYYY", placeholder = "Chọn ngày", className, ...props }) => {
  const [open, setOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState(value ? dayjs(value) : null)

  React.useEffect(() => {
    if (value) {
      setSelectedDate(dayjs(value))
    } else {
      setSelectedDate(null)
    }
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
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-gray-500",
            className
          )}
          {...props}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {selectedDate ? selectedDate.format(format) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4">
          <input
            type="date"
            value={selectedDate ? selectedDate.format('YYYY-MM-DD') : ''}
            onChange={(e) => {
              if (e.target.value) {
                handleDateSelect(dayjs(e.target.value))
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

const RangePicker = ({ value, onChange, format = "DD/MM/YYYY", allowClear = true, className, ...props }) => {
  const [open, setOpen] = React.useState(false)
  const [startDate, setStartDate] = React.useState(value?.[0] ? dayjs(value[0]) : null)
  const [endDate, setEndDate] = React.useState(value?.[1] ? dayjs(value[1]) : null)

  React.useEffect(() => {
    if (value?.[0]) {
      setStartDate(dayjs(value[0]))
    } else {
      setStartDate(null)
    }
    if (value?.[1]) {
      setEndDate(dayjs(value[1]))
    } else {
      setEndDate(null)
    }
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
          className={cn(
            "w-full justify-start text-left font-normal",
            !startDate && !endDate && "text-gray-500",
            className
          )}
          {...props}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Từ ngày</label>
            <input
              type="date"
              value={startDate ? startDate.format('YYYY-MM-DD') : ''}
              onChange={(e) => {
                if (e.target.value) {
                  handleStartDateChange(dayjs(e.target.value))
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Đến ngày</label>
            <input
              type="date"
              value={endDate ? endDate.format('YYYY-MM-DD') : ''}
              onChange={(e) => {
                if (e.target.value) {
                  handleEndDateChange(dayjs(e.target.value))
                }
              }}
              min={startDate ? startDate.format('YYYY-MM-DD') : undefined}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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


