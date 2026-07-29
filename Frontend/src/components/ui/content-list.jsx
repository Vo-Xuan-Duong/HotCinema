import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

function ContentList({ entries = [], renderEntry, loading = false, className, ...props }) {
  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin" /></div>
  }
  return (
    <div className={cn("divide-y", className)} {...props}>
      {entries.map((entry, index) => (
        <div key={entry.key ?? entry.id ?? index}>
          {renderEntry ? renderEntry(entry, index) : entry.content}
        </div>
      ))}
    </div>
  )
}

function ContentListItem({ children, actions, className, ...props }) {
  return (
    <div className={cn("flex items-center justify-between p-4 transition-colors hover:bg-muted/50", className)} {...props}>
      <div className="min-w-0 flex-1">{children}</div>
      {actions && <div className="ml-4 flex items-center gap-2">{actions}</div>}
    </div>
  )
}

function ContentListMeta({ leading, heading, description, className, ...props }) {
  return (
    <div className={cn("flex items-start gap-3", className)} {...props}>
      {leading && <div className="shrink-0">{leading}</div>}
      <div className="min-w-0 flex-1">
        {heading && <div className="mb-1 text-sm font-medium">{heading}</div>}
        {description && <div className="text-xs text-muted-foreground">{description}</div>}
      </div>
    </div>
  )
}

ContentListItem.Meta = ContentListMeta

export { ContentList, ContentListItem }
