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
        "flex flex-col items-center justify-center py-12 px-4",
        className
      )}
      {...props}
    >
      {image || (
        <Inbox className="mb-4 h-16 w-16 text-muted-foreground/35" />
      )}
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export { Empty }


