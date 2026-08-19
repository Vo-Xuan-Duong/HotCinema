import * as React from "react"
import { Inbox } from "lucide-react"
import { cn } from "@/lib/utils"

const Empty = ({
  description = "Không có dữ liệu",
  image,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex min-h-40 flex-col items-center justify-center px-4 py-7 text-center",
        className
      )}
      {...props}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
        {image || <Inbox className="h-5 w-5" />}
      </div>
      {React.isValidElement(description) ? (
        <div className="max-w-md text-sm leading-6 text-muted-foreground">{description}</div>
      ) : (
        <p className="max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

export { Empty }
