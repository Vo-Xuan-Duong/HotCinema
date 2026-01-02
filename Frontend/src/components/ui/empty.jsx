import * as React from "react"
import { cn } from "../../lib/utils"
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
        <Inbox className="h-16 w-16 text-gray-300 mb-4" />
      )}
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  )
}

export { Empty }


