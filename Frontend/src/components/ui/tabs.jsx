import * as React from "react"
import { cn } from "../../lib/utils"

const Tabs = ({ 
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

export { Tabs }


