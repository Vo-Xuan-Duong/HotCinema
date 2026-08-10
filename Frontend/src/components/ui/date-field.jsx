import * as React from 'react';
import dayjs from 'dayjs';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const DateField = ({
  value,
  onValueChange,
  onChange,
  displayFormat,
  format,
  placeholder = 'Chọn ngày',
  className,
  ...props
}) => {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(value ? dayjs(value) : null);
  const resolvedFormat = displayFormat || format || 'DD/MM/YYYY';
  const emitChange = onValueChange || onChange;

  React.useEffect(() => {
    setSelectedDate(value ? dayjs(value) : null);
  }, [value]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    emitChange?.(date);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('w-full justify-start text-left font-normal', !selectedDate && 'text-muted-foreground', className)}
          {...props}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {selectedDate ? selectedDate.format(resolvedFormat) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <Input
          type="date"
          value={selectedDate ? selectedDate.format('YYYY-MM-DD') : ''}
          onChange={(event) => {
            if (event.target.value) handleDateSelect(dayjs(event.target.value));
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

const DateRangeField = ({
  value,
  onValueChange,
  onChange,
  displayFormat,
  format,
  clearable,
  allowClear,
  className,
  ...props
}) => {
  const [open, setOpen] = React.useState(false);
  const [startDate, setStartDate] = React.useState(value?.[0] ? dayjs(value[0]) : null);
  const [endDate, setEndDate] = React.useState(value?.[1] ? dayjs(value[1]) : null);
  const resolvedFormat = displayFormat || format || 'DD/MM/YYYY';
  const canClear = clearable ?? allowClear ?? true;
  const emitChange = onValueChange || onChange;

  React.useEffect(() => {
    setStartDate(value?.[0] ? dayjs(value[0]) : null);
    setEndDate(value?.[1] ? dayjs(value[1]) : null);
  }, [value]);

  const handleStartDateChange = (date) => {
    setStartDate(date);
    if (date && endDate && date.isAfter(endDate)) {
      setEndDate(null);
      emitChange?.([date, null]);
    } else {
      emitChange?.([date, endDate || null]);
    }
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    if (startDate && date) {
      emitChange?.([startDate, date]);
      setOpen(false);
    }
  };

  const displayValue = startDate && endDate
    ? `${startDate.format(resolvedFormat)} - ${endDate.format(resolvedFormat)}`
    : startDate
      ? `${startDate.format(resolvedFormat)} - ...`
      : 'Chọn khoảng thời gian';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('w-full justify-start text-left font-normal', !startDate && !endDate && 'text-muted-foreground', className)}
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
              value={startDate ? startDate.format('YYYY-MM-DD') : ''}
              onChange={(event) => event.target.value && handleStartDateChange(dayjs(event.target.value))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Đến ngày</label>
            <Input
              type="date"
              value={endDate ? endDate.format('YYYY-MM-DD') : ''}
              min={startDate ? startDate.format('YYYY-MM-DD') : undefined}
              onChange={(event) => event.target.value && handleEndDateChange(dayjs(event.target.value))}
            />
          </div>
          {canClear && (startDate || endDate) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
                emitChange?.(null);
              }}
            >
              Xóa
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export { DateField, DateRangeField };
