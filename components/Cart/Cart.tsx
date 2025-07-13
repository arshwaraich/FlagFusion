"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import s from "./Cart.module.scss";
import { createClient } from "@supabase/supabase-js";
import { SVG_ID } from "../Board/Board";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

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
    const svgElement = document.getElementById(SVG_ID);
    if (!svgElement) {
      setError('Flag not found!');
      setLoading(false);
      return;
    }
    // Remove scale before serializing ---
    const prevTransform = svgElement.style.transform;
    svgElement.style.transform = '';
    // Serialize SVG at original scale
    const svgData = new XMLSerializer().serializeToString(svgElement);
    // Restore transform
    svgElement.style.transform = prevTransform;
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

      const { data, error } = await supabase.functions.invoke('order', {
        body: JSON.stringify({ png: pngDataUrl }),
      });

      if (error) {
        setError('Failed to place an order, please try again.');
        setLoading(false);
        return;
      }

      const { url } = JSON.parse(data) as { url: string };
      if (!url) {
        setError('Failed to redirect to payment.');
        setLoading(false);
      } else {
        window.location.href = url;
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
