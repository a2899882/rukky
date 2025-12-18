'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/utils/axiosApi';

export default function Page({ searchParams }) {
  const orderNo = searchParams?.orderNo || '';
  const token = searchParams?.q || '';
  const paypalToken = searchParams?.token || '';

  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await api.post('/myapp/shop/pay/paypal/capture', {
          orderNo,
          token,
          paypalOrderId: paypalToken,
        });
        if (res?.code === 0) {
          setOk(true);
          setMsg('Payment captured');
        } else {
          setOk(false);
          setMsg(res?.msg || 'Capture failed');
        }
      } catch (e) {
        setOk(false);
        setMsg(e?.msg || e?.message || 'Capture failed');
      } finally {
        setLoading(false);
      }
    };

    if (orderNo && token && paypalToken) run();
    else {
      setLoading(false);
      setMsg('Missing orderNo/token');
    }
  }, [orderNo, token, paypalToken]);

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

  const inquiryHref = (() => {
    if (!orderNo && !token) return '/#inquiry';
    const params = new URLSearchParams();
    if (orderNo) params.set('inquiryOrderNo', String(orderNo));
    if (token) params.set('inquiryToken', String(token));
    return `/?${params.toString()}#inquiry`;
  })();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold">Payment result</h1>
      <div className="mt-6 bg-white border rounded-md p-6">
        {loading ? (
          <div className="text-gray-600">Capturing...</div>
        ) : ok ? (
          <div>
            <div className="text-green-700 font-medium">Payment successful</div>
            <div className="mt-2 text-sm text-gray-600">Thank you. Your order is confirmed.</div>
          </div>
        ) : (
          <div>
            <div className="text-red-700 font-medium">Payment not confirmed</div>
            <div className="mt-2 text-sm text-gray-600">{msg}</div>
            <div className="mt-3 text-xs text-gray-500">If you already paid, please use Order Query to check status. You can also retry in a moment.</div>
          </div>
        )}

        {orderNo ? (
          <div className="mt-5 rounded-md border bg-gray-50 p-4 text-sm">
            <div className="text-gray-600">Order No</div>
            <div className="font-mono text-gray-900 break-all">{orderNo}</div>
            {token ? (
              <div className="mt-3">
                <div className="text-gray-600">Query Token</div>
                <div className="font-mono text-gray-900 break-all">{token}</div>
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2">
              <button className="rounded-md px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-50" onClick={() => copyText(orderNo)}>Copy order no</button>
              <button className="rounded-md px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-50" onClick={() => copyText(token)}>Copy token</button>
              <button
                className="rounded-md px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-50"
                onClick={() => copyText(`Order No: ${orderNo}\nToken: ${token}`)}
              >
                Copy both
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex gap-4">
          <Link href="/product" className="rounded-md px-4 py-2 bg-black text-white hover:bg-gray-800">Continue shopping</Link>
          <Link href="/order/query" className="rounded-md px-4 py-2 border border-gray-300 text-gray-800 hover:bg-gray-50">Order query</Link>
          <Link href={inquiryHref} className="rounded-md px-4 py-2 border border-gray-300 text-gray-800 hover:bg-gray-50">Contact us</Link>
        </div>
      </div>
    </div>
  );
}
