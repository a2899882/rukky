'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import api from '@/utils/axiosApi';
import { clearCart, readCart } from '@/utils/cart';

const DEFAULT_CURRENCY = (process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || 'USD').toUpperCase();
const DEFAULT_SHIPPING_FEE = Number(process.env.NEXT_PUBLIC_SHIPPING_FEE || 0);

export default function Page() {
  const [items, setItems] = useState([]);
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [shippingFee, setShippingFee] = useState(DEFAULT_SHIPPING_FEE);
  const [shopSettings, setShopSettings] = useState({ enableStripe: true, enablePayPal: true });
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');

  const TrustPanel = ({ variant = 'checkout' }) => {
    return (
      <div className="mt-6 rounded-md border bg-gray-50 p-4 text-sm">
        <div className="font-semibold text-gray-900">Secure checkout</div>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-gray-600">
          <div>
            <div className="font-medium text-gray-800">Payments</div>
            <div className="text-xs">Stripe / PayPal supported</div>
          </div>
          <div>
            <div className="font-medium text-gray-800">Support</div>
            <div className="text-xs">
              Questions? <Link href="/#inquiry" className="text-blue-600 hover:underline">Send an inquiry</Link>
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-800">Order tracking</div>
            <div className="text-xs">Use order no + token to query anytime</div>
          </div>
        </div>

        {variant === 'after' ? (
          <div className="mt-4 text-xs text-gray-500">
            Tip: If you prefer, you can pay later. Your order is saved and can be queried using the token.
          </div>
        ) : null}
      </div>
    );
  };

  useEffect(() => {
    setItems(readCart());
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/myapp/shop/settings');
        if (res?.code === 0 && res?.data) {
          setShopSettings({
            enableStripe: !!res.data.enableStripe,
            enablePayPal: !!res.data.enablePayPal,
          });
          if (res.data.defaultCurrency) setCurrency(String(res.data.defaultCurrency).toUpperCase());
          if (res.data.defaultShippingFee != null) setShippingFee(Number(res.data.defaultShippingFee));
        }
      } catch (e) {
      }
    };
    load();
  }, []);

  const subtotal = useMemo(() => {
    return items.reduce((acc, it) => {
      const p = Number(it?.price || 0);
      const q = Number(it?.quantity || 1);
      return acc + p * q;
    }, 0);
  }, [items]);

  const total = useMemo(() => subtotal + Number(shippingFee || 0), [subtotal, shippingFee]);

  const copyText = async (text) => {
    try {
      if (!text) return;
      await navigator.clipboard.writeText(String(text));
    } catch (e) {
      try {
        const el = document.createElement('textarea');
        el.value = String(text);
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      } catch (e2) {
      }
    }
  };

  const inquiryHref = useMemo(() => {
    if (!result?.orderNo && !result?.token) return '/#inquiry';
    const params = new URLSearchParams();
    if (result?.orderNo) params.set('inquiryOrderNo', String(result.orderNo));
    if (result?.token) params.set('inquiryToken', String(result.token));
    return `/?${params.toString()}#inquiry`;
  }, [result?.orderNo, result?.token]);

  const createOrder = async () => {
    setErr('');
    setSubmitting(true);
    try {
      const payload = {
        items: items.map((x) => ({ thingId: x.thingId, skuId: x.skuId || null, quantity: x.quantity })),
        currency,
        shippingFee,
        email,
        phone,
      };
      const res = await api.post('/myapp/shop/order/create', payload);
      if (res?.code === 0) {
        setResult(res.data);
        clearCart();
      } else {
        setErr(res?.msg || 'Create order failed');
      }
    } catch (e) {
      setErr(e?.msg || e?.message || 'Create order failed');
    } finally {
      setSubmitting(false);
    }
  };

  const payStripe = async () => {
    if (!result?.orderNo || !result?.token) return;
    setErr('');
    try {
      const res = await api.post('/myapp/shop/pay/stripe/createSession', {
        orderNo: result.orderNo,
        token: result.token,
      });
      if (res?.code === 0) {
        const url = res?.data?.checkoutUrl;
        if (url) {
          window.location.href = url;
        } else {
          setErr('Stripe session created, but checkoutUrl is empty (need Stripe keys).');
        }
      } else {
        setErr(res?.msg || 'Stripe create session failed');
      }
    } catch (e) {
      setErr(e?.msg || e?.message || 'Stripe create session failed');
    }
  };

  const payPayPal = async () => {
    if (!result?.orderNo || !result?.token) return;
    setErr('');
    try {
      const res = await api.post('/myapp/shop/pay/paypal/createOrder', {
        orderNo: result.orderNo,
        token: result.token,
      });
      if (res?.code === 0) {
        const url = res?.data?.approveUrl;
        if (url) {
          window.location.href = url;
        } else {
          setErr('PayPal order created, but approveUrl is empty (need PayPal keys).');
        }
      } else {
        setErr(res?.msg || 'PayPal create order failed');
      }
    } catch (e) {
      setErr(e?.msg || e?.message || 'PayPal create order failed');
    }
  };

  if (items.length === 0 && !result) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <div className="mt-6 bg-white border rounded-md p-6 text-gray-600">
          Your cart is empty.
          <div className="mt-4">
            <Link href="/product" className="text-blue-600 hover:underline">Go to products</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold">Checkout</h1>

      {err ? (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm">{err}</div>
      ) : null}

      {!result ? (
        <div className="mt-6 bg-white border rounded-md p-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input className="w-full border rounded px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Phone</label>
              <input className="w-full border rounded px-3 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Currency</label>
                <select className="w-full border rounded px-3 py-2" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CNY">CNY</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Shipping fee</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  type="number"
                  min={0}
                  value={shippingFee}
                  onChange={(e) => setShippingFee(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 border-t pt-4 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-600 mt-2"><span>Shipping</span><span>${Number(shippingFee || 0).toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold mt-2"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </div>

          <button
            className={`mt-6 w-full rounded-md px-4 py-2 text-white ${submitting ? 'bg-gray-400' : 'bg-black hover:bg-gray-800'}`}
            disabled={submitting}
            onClick={createOrder}
          >
            {submitting ? 'Creating...' : 'Create order'}
          </button>

          <div className="mt-3 text-xs text-gray-500">
            After creating the order, you will get an order number and token for order tracking.
          </div>

          <TrustPanel />
        </div>
      ) : (
        <div className="mt-6 bg-white border rounded-md p-6">
          <div className="text-lg font-semibold">Order created</div>
          <div className="mt-3 text-sm text-gray-600">Order No: <span className="font-mono text-gray-900">{result.orderNo}</span></div>
          <div className="mt-1 text-sm text-gray-600">Query Token: <span className="font-mono text-gray-900">{result.token}</span></div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button className="rounded-md px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-50" onClick={() => copyText(result.orderNo)}>Copy order no</button>
            <button className="rounded-md px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-50" onClick={() => copyText(result.token)}>Copy token</button>
            <button
              className="rounded-md px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-50"
              onClick={() => copyText(`Order No: ${result.orderNo}\nToken: ${result.token}`)}
            >
              Copy both
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Need help? <Link href={inquiryHref} className="text-blue-600 hover:underline">Contact us</Link>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {shopSettings.enableStripe ? (
              <button className="rounded-md px-4 py-2 bg-black text-white hover:bg-gray-800" onClick={payStripe}>Pay with Stripe</button>
            ) : (
              <button className="rounded-md px-4 py-2 bg-gray-200 text-gray-500" disabled>Stripe disabled</button>
            )}
            {shopSettings.enablePayPal ? (
              <button className="rounded-md px-4 py-2 bg-blue-600 text-white hover:bg-blue-700" onClick={payPayPal}>Pay with PayPal</button>
            ) : (
              <button className="rounded-md px-4 py-2 bg-gray-200 text-gray-500" disabled>PayPal disabled</button>
            )}
          </div>

          <TrustPanel variant="after" />

          <div className="mt-6 text-sm">
            <Link href={`/order/query`} className="text-blue-600 hover:underline">Go to order query</Link>
          </div>
        </div>
      )}
    </div>
  );
}
