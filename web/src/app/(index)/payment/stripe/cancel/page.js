'use client';

import Link from 'next/link';

export default function Page() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold">Stripe Payment</h1>
      <div className="mt-6 bg-white border rounded-md p-6">
        <div className="text-gray-700">Payment cancelled.</div>
        <div className="mt-6 flex gap-4">
          <Link href="/checkout" className="text-blue-600 hover:underline">Back to checkout</Link>
          <Link href="/cart" className="text-blue-600 hover:underline">Back to cart</Link>
        </div>
      </div>
    </div>
  );
}
