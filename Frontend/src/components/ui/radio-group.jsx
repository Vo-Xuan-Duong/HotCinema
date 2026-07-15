import * as React from "react"
import { cn } from "@/lib/utils"

const RadioGroup = ({ 
  value,
  onChange,
  children,
  className,
  ...props 
}) => {
  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            checked: child.props.value === value,
            onChange: () => onChange?.(child.props.value)
          });
        }
        return child;
      })}
    </div>
  )
}

const RadioButton = ({ 
  value,
  checked = false,
  onChange,
  children,
  className,
  ...props 
}) => {
  return (
    <label
      className={cn(
        "flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
        checked
          ? "border-primary bg-primary/5"
          : "border-gray-200 hover:border-primary/50",
        className
      )}
      onClick={onChange}
      {...props}
    >
      <input
        type="radio"
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <div className={cn(
        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
        checked
          ? "border-primary"
          : "border-gray-300"
      )}>
        {checked && (
          <div className="w-3 h-3 rounded-full bg-primary" />
        )}
      </div>
      {children}
    </label>
  )
}

RadioGroup.Button = RadioButton

export { RadioGroup }


