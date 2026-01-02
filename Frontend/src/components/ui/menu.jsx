import * as React from "react"
import { cn } from "../../lib/utils"
import { useNavigate, useLocation } from "react-router-dom"

const MenuContext = React.createContext({
  selectedKeys: [],
  onClick: () => {},
})

const Menu = ({ 
  items = [], 
  selectedKeys = [], 
  onClick,
  mode = "horizontal",
  className,
  ...props 
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [internalSelectedKeys, setInternalSelectedKeys] = React.useState(
    selectedKeys.length > 0 ? selectedKeys : [location.pathname]
  )

  React.useEffect(() => {
    if (selectedKeys.length > 0) {
      setInternalSelectedKeys(selectedKeys)
    } else {
      setInternalSelectedKeys([location.pathname])
    }
  }, [selectedKeys, location.pathname])

  const handleClick = (key, item) => {
    if (onClick) {
      onClick(key, item)
    } else {
      navigate(key)
    }
    setInternalSelectedKeys([key])
  }

  const isHorizontal = mode === "horizontal"
  const isVertical = mode === "vertical"

  return (
    <MenuContext.Provider value={{ selectedKeys: internalSelectedKeys, onClick: handleClick }}>
      <nav
        className={cn(
          isHorizontal && "flex items-center space-x-1",
          isVertical && "flex flex-col space-y-1",
          className
        )}
        {...props}
      >
        {items.map((item) => (
          <MenuItem key={item.key} item={item} />
        ))}
      </nav>
    </MenuContext.Provider>
  )
}

const MenuItem = ({ item }) => {
  const { selectedKeys, onClick } = React.useContext(MenuContext)
  const isSelected = selectedKeys.includes(item.key)

  return (
    <button
      onClick={() => onClick(item.key, item)}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
        "hover:bg-primary/10 hover:text-primary",
        isSelected && "bg-primary/20 text-primary font-semibold",
        item.className
      )}
    >
      {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
      <span>{item.label}</span>
    </button>
  )
}

export { Menu }


