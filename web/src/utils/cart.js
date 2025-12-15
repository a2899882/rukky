const CART_KEY = 'bm_cart_v1';

const readCart = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    const items = raw ? JSON.parse(raw) : [];
    return Array.isArray(items) ? items : [];
  } catch (e) {
    return [];
  }
};

const writeCart = (items) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(items || []));
};

const addToCart = (item) => {
  const items = readCart();
  const thingId = item?.thingId;
  if (!thingId) return items;

  const skuId = item?.skuId || null;

  const quantity = Number(item?.quantity || 1);
  const next = items.slice();
  const idx = next.findIndex((x) => x.thingId === thingId && (x.skuId || null) === (skuId || null));
  if (idx >= 0) {
    next[idx] = {
      ...next[idx],
      quantity: Math.max(1, (Number(next[idx].quantity || 1) + quantity)),
    };
  } else {
    next.push({
      thingId,
      skuId,
      skuLabel: item?.skuLabel || '',
      title: item?.title || '',
      cover: item?.cover || '',
      price: item?.price || '0',
      quantity: Math.max(1, quantity),
    });
  }
  writeCart(next);
  return next;
};

const updateQuantity = (thingId, quantity, skuId = null) => {
  const items = readCart();
  const next = items.map((it) => {
    if (it.thingId !== thingId) return it;
    if ((it.skuId || null) !== (skuId || null)) return it;
    return { ...it, quantity: Math.max(1, Number(quantity || 1)) };
  });
  writeCart(next);
  return next;
};

const removeFromCart = (thingId, skuId = null) => {
  const items = readCart();
  const next = items.filter((it) => !(it.thingId === thingId && (it.skuId || null) === (skuId || null)));
  writeCart(next);
  return next;
};

const clearCart = () => {
  writeCart([]);
};

export { readCart, writeCart, addToCart, updateQuantity, removeFromCart, clearCart };
