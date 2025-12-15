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

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold">PayPal Payment</h1>
      <div className="mt-6 bg-white border rounded-md p-6">
        {loading ? (
          <div className="text-gray-600">Capturing...</div>
        ) : ok ? (
          <div className="text-green-700">{msg}</div>
        ) : (
          <div className="text-red-700">{msg}</div>
        )}
        <div className="mt-6 flex gap-4">
          <Link href="/order/query" className="text-blue-600 hover:underline">Query order</Link>
          <Link href="/product" className="text-blue-600 hover:underline">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}
