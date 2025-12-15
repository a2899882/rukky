'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/utils/axiosApi';

export default function Page({ searchParams }) {
  const orderNo = searchParams?.orderNo || '';
  const token = searchParams?.token || '';
  const sessionId = searchParams?.session_id || '';

  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await api.post('/myapp/shop/pay/stripe/confirm', {
          orderNo,
          token,
          sessionId,
        });
        if (res?.code === 0) {
          setOk(true);
          setMsg('Payment confirmed');
        } else {
          setOk(false);
          setMsg(res?.msg || 'Confirm failed');
        }
      } catch (e) {
        setOk(false);
        setMsg(e?.msg || e?.message || 'Confirm failed');
      } finally {
        setLoading(false);
      }
    };
    if (orderNo && token) run();
    else {
      setLoading(false);
      setMsg('Missing orderNo/token');
    }
  }, [orderNo, token, sessionId]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold">Stripe Payment</h1>
      <div className="mt-6 bg-white border rounded-md p-6">
        {loading ? (
          <div className="text-gray-600">Confirming...</div>
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
