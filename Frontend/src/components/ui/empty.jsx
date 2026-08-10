import * as React from "react"
import { cn } from "@/lib/utils"
import { Inbox } from "lucide-react"

const Empty = ({
  description = "Không có dữ liệu",
  image,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-4 py-6 text-center",
        className
      )}
      {...props}
    >
      {image || (
        <Inbox className="mb-2 h-10 w-10 text-muted-foreground/35" />
      )}
      {React.isValidElement(description) ? (
        <div className="text-sm text-muted-foreground">{description}</div>
      ) : (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

export { Empty }
