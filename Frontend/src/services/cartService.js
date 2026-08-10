const CART_KEY = "hotcinema_cart"

function read() {
  try {
    const value = JSON.parse(localStorage.getItem(CART_KEY) || "[]")
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function write(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
  window.dispatchEvent(new CustomEvent("hotcinema:cart-change", { detail: items }))
  return items
}

const cartService = {
  list: read,
  add(item) {
    const items = read()
    const index = items.findIndex((existing) => existing.id === item.id)
    if (index >= 0) items[index] = { ...items[index], ...item }
    else items.push(item)
    return write(items)
  },
  remove(id) {
    return write(read().filter((item) => item.id !== id))
  },
  clear() {
    return write([])
  },
}

export default cartService
