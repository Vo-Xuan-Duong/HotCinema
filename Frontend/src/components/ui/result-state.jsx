import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const states = {
  success: { icon: CheckCircle2, className: "bg-emerald-50 text-emerald-600" },
  error: { icon: XCircle, className: "bg-destructive/10 text-destructive" },
  info: { icon: Info, className: "bg-sky-50 text-sky-600" },
  warning: { icon: AlertCircle, className: "bg-amber-50 text-amber-600" },
}

function ResultState({ state = "success", heading, description, actions, icon, className, ...props }) {
  const config = states[state] || states.success
  const Icon = config.icon
  return (
    <div className={cn("flex flex-col items-center justify-center px-4 py-8 text-center", className)} {...props}>
      <div className={cn("mb-4 rounded-full p-4", config.className)}>{icon || <Icon className="h-16 w-16" />}</div>
      {heading && <h3 className="mb-2 text-xl font-semibold">{heading}</h3>}
      {description && <p className="mb-6 max-w-md text-sm text-muted-foreground">{description}</p>}
      {actions && <div className="flex flex-wrap justify-center gap-2">{actions}</div>}
    </div>
  )
}

export { ResultState }
