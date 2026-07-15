import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "../../lib/utils"

const LegacyTabs = ({ 
  activeKey,
  defaultActiveKey,
  items = [],
  onChange,
  className,
  ...props 
}) => {
  const [activeTab, setActiveTab] = React.useState(activeKey || defaultActiveKey || items[0]?.key)

  React.useEffect(() => {
    if (activeKey !== undefined) {
      setActiveTab(activeKey)
    }
  }, [activeKey])

  const handleTabChange = (key) => {
    setActiveTab(key)
    onChange?.(key)
  }

  const activeItem = items.find(item => item.key === activeTab) || items[0]

  return (
    <div className={cn("w-full", className)} {...props}>
      <div className="flex border-b border-gray-200 mb-4">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => handleTabChange(item.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === item.key
                ? "border-primary text-primary"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div>
        {activeItem?.children}
      </div>
    </div>
  )
}

const TabsPrimitiveRoot = TabsPrimitive.Root

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

const Tabs = React.forwardRef(({ items, ...props }, ref) => {
  if (items && items.length > 0) {
    return <LegacyTabs items={items} {...props} />
  }
  return <TabsPrimitiveRoot ref={ref} {...props} />
})
Tabs.displayName = "Tabs"

export { Tabs, TabsList, TabsTrigger, TabsContent }
