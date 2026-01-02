import * as React from "react"
import { cn } from "../../lib/utils"
import { useFormContext, Controller } from "react-hook-form"

const Form = ({ className, ...props }) => (
  <form className={cn("space-y-4", className)} {...props} />
)
Form.displayName = "Form"

const FormItem = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props} />
))
FormItem.displayName = "FormItem"

const FormField = ({ control, name, render, rules, ...props }) => {
  const formContext = useFormContext()
  const actualControl = control || formContext?.control

  if (!actualControl) {
    console.warn('FormField: control is required. Make sure FormField is used within a FormProvider or pass control prop.')
    return null
  }

  // Convert rules to react-hook-form rules format if needed
  const reactHookFormRules = React.useMemo(() => {
    if (!rules) return undefined
    
    // If rules is already in react-hook-form format, return as is
    if (typeof rules === 'object' && !Array.isArray(rules)) {
      return rules
    }
    
    // If rules is an array (Ant Design format), convert to object
    if (Array.isArray(rules)) {
      const rulesObj = {}
      rules.forEach(rule => {
        if (rule.required) {
          rulesObj.required = rule.message || 'This field is required'
        }
        if (rule.minLength) {
          rulesObj.minLength = {
            value: rule.minLength.value || rule.minLength,
            message: rule.minLength.message || `Minimum length is ${rule.minLength.value || rule.minLength}`
          }
        }
        if (rule.maxLength) {
          rulesObj.maxLength = {
            value: rule.maxLength.value || rule.maxLength,
            message: rule.maxLength.message || `Maximum length is ${rule.maxLength.value || rule.maxLength}`
          }
        }
        if (rule.type === 'email') {
          rulesObj.pattern = {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: rule.message || 'Invalid email address'
          }
        }
        if (rule.pattern) {
          rulesObj.pattern = {
            value: rule.pattern,
            message: rule.message || 'Invalid format'
          }
        }
        if (rule.validator) {
          rulesObj.validate = rule.validator
        }
      })
      return rulesObj
    }
    
    return rules
  }, [rules])

  return (
    <Controller
      control={actualControl}
      name={name}
      rules={reactHookFormRules}
      render={({ field, fieldState, formState }) => {
        return render({
          field,
          fieldState,
          formState
        })
      }}
      {...props}
    />
  )
}
FormField.displayName = "FormField"

const FormLabel = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
))
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef(({ ...props }, ref) => (
  <div ref={ref} {...props} />
))
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef(({ className, children, fieldState, ...props }, ref) => {
  const errorMessage = fieldState?.error?.message || children

  if (!errorMessage) {
    return null
  }

  return (
    <p
      ref={ref}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {errorMessage}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
}

