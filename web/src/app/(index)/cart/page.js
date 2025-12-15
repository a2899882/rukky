'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { readCart, removeFromCart, updateQuantity } from '@/utils/cart';

export default function Page() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(readCart());
  }, []);

  const subtotal = useMemo(() => {
    return items.reduce((acc, it) => {
      const p = Number(it?.price || 0);
      const q = Number(it?.quantity || 1);
      return acc + p * q;
    }, 0);
  }, [items]);

  const onQty = (thingId, skuId, v) => {
    setItems(updateQuantity(thingId, v, skuId));
  };

  const onRemove = (thingId, skuId) => {
    setItems(removeFromCart(thingId, skuId));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Cart</h1>
        <Link href="/product" className="text-sm text-blue-600 hover:underline">Continue shopping</Link>
      </div>

      <div className="mt-6 bg-white border rounded-md">
        {items.length === 0 ? (
          <div className="p-8 text-gray-600">Your cart is empty.</div>
        ) : (
          <div className="divide-y">
            {items.map((it) => (
              <div key={`${it.thingId}-${it.skuId || 'na'}`} className="p-4 flex gap-4 items-center">
                <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                  {it.cover ? (
                    <img alt={it.title || ''} src={it.cover} className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-xs text-gray-400">No image</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{it.title || 'Product'}</div>
                  {it.skuLabel ? (
                    <div className="text-xs text-gray-500">{it.skuLabel}</div>
                  ) : null}
                  <div className="text-sm text-gray-500">${Number(it.price || 0).toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    className="w-20 border rounded px-2 py-1"
                    type="number"
                    min={1}
                    value={it.quantity || 1}
                    onChange={(e) => onQty(it.thingId, it.skuId || null, e.target.value)}
                  />
                  <button
                    className="text-sm text-red-600 hover:underline"
                    onClick={() => onRemove(it.thingId, it.skuId || null)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-end">
        <div className="w-full max-w-sm bg-white border rounded-md p-4">
          <div className="flex items-center justify-between">
            <div className="text-gray-600">Subtotal</div>
            <div className="font-semibold">${subtotal.toFixed(2)}</div>
          </div>
          <div className="mt-4">
            <Link
              href="/checkout"
              className={`block text-center rounded-md px-4 py-2 text-white ${items.length ? 'bg-black hover:bg-gray-800' : 'bg-gray-300 pointer-events-none'}`}
            >
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
