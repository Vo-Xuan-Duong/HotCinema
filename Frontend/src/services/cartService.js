class CartService {
  constructor() {
    this.storageKey = 'hotcinema_cart';
  }

  _getCart() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  _setCart(cart) {
    localStorage.setItem(this.storageKey, JSON.stringify(cart));
    this._dispatchChangeEvent();
  }

  _dispatchChangeEvent() {
    window.dispatchEvent(new Event('hotcinema:cart-change'));
  }

  add(item) {
    const cart = this._getCart();
    const index = cart.findIndex(i => i.id === item.id);
    if (index !== -1) {
      cart[index] = { ...cart[index], ...item };
    } else {
      cart.push(item);
    }
    this._setCart(cart);
  }

  list() {
    return this._getCart();
  }

  remove(id) {
    let cart = this._getCart();
    cart = cart.filter(i => i.id !== id);
    this._setCart(cart);
  }

  clear() {
    this._setCart([]);
  }
}

const cartService = new CartService();
export default cartService;
