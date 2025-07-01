"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import s from "./Cart.module.scss";
import { useState } from "react";
import { config } from '../../config';

const Cart = ({
  setShowCart,
}: {
  setShowCart: (value: boolean) => void;
}) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const handleOrder = async () => {
    setError(null);
    setLoading(true);
    // Get the SVG element
    const svgElement = document.getElementById('color-change-svg');
    if (!svgElement) {
      setError('Flag not found!');
      setLoading(false);
      return;
    }
    // Serialize SVG
    const svgData = new XMLSerializer().serializeToString(svgElement);
    // Create PNG from SVG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new window.Image();
    img.onload = async () => {
      const newWidth = Math.max(img.width, 1000);
      const newHeight = img.height * (newWidth / img.width);
      canvas.width = newWidth;
      canvas.height = newHeight;
      ctx?.drawImage(img, 0, 0, newWidth, newHeight);
      const pngDataUrl = canvas.toDataURL('image/png');
      // POST to API (send only png)
      try {
        const orderRes = await fetch(`${config.API_BASE_URL}/functions/v1/order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ png: pngDataUrl })
        });
        if (!orderRes.ok) throw new Error('Order creation failed');
        const { url } = await orderRes.json();
        if (url) {
          window.location.href = url;
        } else {
          setError('Failed to redirect to payment.');
          setLoading(false);
        }
      } catch (e) {
        setError('Failed to place an order, please try again.');
        setLoading(false);
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };
  return (
    <div className={s.cart}>
      <button className={s.closeButton} onClick={() => setShowCart(false)}>
        <XMarkIcon className={s.icon} />
      </button>
      <h1>Get a print of your flag!</h1>
      <span>$5</span>
      {error && (
        <div className="bg-red-500 text-white rounded px-4 py-2 my-2 text-center">
          {error}
        </div>
      )}
      <button className={s.checkoutButton} onClick={handleOrder} disabled={loading}>
        ORDER
      </button>
    </div>
  );
};

export default Cart;
