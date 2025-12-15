'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addToCart } from '@/utils/cart';

export default function AddToCartButtons({ product, selectedSku }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const normalized = useMemo(() => {
    const thingId = product?.id;
    const title = product?.title || '';
    const cover = product?.coverUrl || '';
    const price = product?.price || '0';
    const skuId = selectedSku?.id || null;
    const skuLabel = selectedSku?.label || '';
    const skuPrice = selectedSku?.price;
    const skuCoverUrl = selectedSku?.coverUrl;
    return {
      thingId,
      skuId,
      skuLabel,
      title,
      cover: skuCoverUrl || cover,
      price: (skuPrice != null && String(skuPrice).length > 0) ? skuPrice : price,
    };
  }, [product, selectedSku]);

  const onAdd = async () => {
    if (!normalized.thingId) return;
    setLoading(true);
    try {
      addToCart({
        thingId: normalized.thingId,
        skuId: normalized.skuId,
        skuLabel: normalized.skuLabel,
        title: normalized.title,
        cover: normalized.cover,
        price: normalized.price,
        quantity: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  const onBuyNow = async () => {
    await onAdd();
    router.push('/checkout');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        type="button"
        onClick={onAdd}
        disabled={loading}
        className={`w-full sm:w-auto px-6 py-3 text-sm font-medium border border-gray-900 text-gray-900 hover:bg-gray-50 transition-colors ${loading ? 'opacity-60' : ''}`}
      >
        Add to cart
      </button>
      <button
        type="button"
        onClick={onBuyNow}
        disabled={loading}
        className={`w-full sm:w-auto px-6 py-3 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors ${loading ? 'opacity-60' : ''}`}
      >
        Buy now
      </button>
    </div>
  );
}
