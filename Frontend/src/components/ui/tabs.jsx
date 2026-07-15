import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const TabsRoot = TabsPrimitive.Root

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

const Tabs = React.forwardRef(({
  items,
  activeKey,
  defaultActiveKey,
  onChange,
  className,
  ...props
}, ref) => {
  if (!items?.length) {
    return <TabsRoot ref={ref} className={className} {...props} />
  }

  const value = activeKey ?? undefined
  const defaultValue = defaultActiveKey ?? items[0]?.key

  return (
    <TabsRoot
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onChange}
      className={cn("w-full", className)}
      {...props}
    >
      <TabsList className="mb-4">
        {items.map((item) => (
          <TabsTrigger key={item.key} value={item.key} disabled={item.disabled}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((item) => (
        <TabsContent key={item.key} value={item.key}>
          {item.children}
        </TabsContent>
      ))}
    </TabsRoot>
  )
})
Tabs.displayName = "Tabs"

export { Tabs, TabsList, TabsTrigger, TabsContent }
