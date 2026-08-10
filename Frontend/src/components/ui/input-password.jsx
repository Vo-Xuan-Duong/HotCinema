import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const InputPassword = React.forwardRef(({ className, prefix, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative w-full">
      {prefix && (
        <span className="pointer-events-none absolute left-3 top-1/2 z-10 flex -translate-y-1/2 text-muted-foreground">
          {prefix}
        </span>
      )}
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        className={cn(prefix ? 'pl-10 pr-11' : 'pr-11', className)}
        {...props}
      />
      <button
        type="button"
        className="absolute right-0 top-0 z-10 flex h-full items-center justify-center rounded-r-md px-3 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        onClick={(event) => {
          event.preventDefault();
          setShowPassword((value) => !value);
        }}
        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});
InputPassword.displayName = 'InputPassword';

export { InputPassword };
