import * as React from "react"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"

const Breadcrumb = ({ items = [], className, ...props }) => {
  return (
    <nav className={cn("flex items-center space-x-1 text-sm", className)} {...props}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        const content = (
          <span className="flex items-center gap-1.5">
            {item.icon && item.icon}
            {item.title}
          </span>
        )

        return (
          <React.Fragment key={index}>
            {isLast ? (
              <span className="text-muted-foreground font-medium">{content}</span>
            ) : (
              <>
                {item.href ? (
                  <Link to={item.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {content}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">{content}</span>
                )}
                <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
              </>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

export { Breadcrumb }


