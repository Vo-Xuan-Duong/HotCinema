import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "./input"
import { Button } from "./button"
import { cn } from "../../lib/utils"

const InputPassword = React.forwardRef(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className="relative w-full">
      <Input
        type={showPassword ? "text" : "password"}
        ref={ref}
        className={cn("pr-11", className)}
        {...props}
      />
      <button
        type="button"
        className="absolute right-0 top-0 h-full px-3 py-2 flex items-center justify-center hover:bg-transparent focus:outline-none focus:ring-0 transition-colors z-10"
        onClick={(e) => {
          e.preventDefault();
          setShowPassword(!showPassword);
        }}
        tabIndex={-1}
        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
        ) : (
          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
        )}
      </button>
    </div>
  )
})
InputPassword.displayName = "InputPassword"

export { InputPassword }
