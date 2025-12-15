'use client';

import { useState } from 'react';
import api from '@/utils/axiosApi';

export default function Page() {
  const [orderNo, setOrderNo] = useState('');
  const [token, setToken] = useState('');
  const [err, setErr] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const query = async () => {
    setErr('');
    setData(null);
    setLoading(true);
    try {
      const res = await api.get('/myapp/shop/order/query', {
        params: { orderNo, token },
      });
      if (res?.code === 0) {
        setData(res.data);
      } else {
        setErr(res?.msg || 'Query failed');
      }
    } catch (e) {
      setErr(e?.msg || e?.message || 'Query failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold">Order Query</h1>

      <div className="mt-6 bg-white border rounded-md p-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Order No</label>
            <input className="w-full border rounded px-3 py-2" value={orderNo} onChange={(e) => setOrderNo(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Token</label>
            <input className="w-full border rounded px-3 py-2" value={token} onChange={(e) => setToken(e.target.value)} />
          </div>
        </div>

        {err ? (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm">{err}</div>
        ) : null}

        <button
          className={`mt-6 w-full rounded-md px-4 py-2 text-white ${loading ? 'bg-gray-400' : 'bg-black hover:bg-gray-800'}`}
          onClick={query}
          disabled={loading}
        >
          {loading ? 'Querying...' : 'Query'}
        </button>
      </div>

      {data ? (
        <div className="mt-6 bg-white border rounded-md p-6">
          <div className="flex items-center justify-between">
            <div className="font-semibold">{data.orderNo}</div>
            <div className="text-sm text-gray-600">Status: {data.status}</div>
          </div>
          <div className="mt-2 text-sm text-gray-600">Currency: {data.currency}</div>
          <div className="mt-1 text-sm text-gray-600">Total: ${Number(data.total || 0).toFixed(2)}</div>

          <div className="mt-4 border-t pt-4">
            <div className="font-medium mb-2">Items</div>
            <div className="divide-y">
              {(data.items || []).map((it) => (
                <div key={it.id} className="py-3 flex items-center justify-between text-sm">
                  <div className="text-gray-900">{it.title_snapshot}</div>
                  <div className="text-gray-600">x{it.quantity}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
