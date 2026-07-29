import * as React from "react"
import { cn } from "@/lib/utils"

const DetailItem = ({ label, children, wide = false, className }) => (
  <div className={cn("space-y-1 border-b p-4 last:border-b-0", wide && "sm:col-span-2", className)}>
    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
    <dd className="break-words text-sm text-foreground">{children}</dd>
  </div>
)

const DetailList = ({ columns = 2, items = [], children, className }) => {
  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  }[columns] || "grid-cols-1 sm:grid-cols-2"

  return (
    <dl className={cn("grid overflow-hidden rounded-lg border bg-card", gridClass, className)}>
      {items.length > 0
        ? items.map((item, index) => (
          <DetailItem key={item.id || item.key || index} label={item.label} wide={item.wide}>
            {item.content ?? item.children}
          </DetailItem>
        ))
        : children}
    </dl>
  )
}

export { DetailItem, DetailList }
