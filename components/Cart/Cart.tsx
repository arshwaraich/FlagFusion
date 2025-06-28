"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import s from "./Cart.module.scss";

const Cart = ({
  setShowCart,
}: {
  setShowCart: (value: boolean) => void;
}) => {
  return (
    <div className={s.cart}>
      <button className={s.closeButton} onClick={() => setShowCart(false)}>
        <XMarkIcon className={s.icon} />
      </button>
      <h1>Get a print of your flag!</h1>
      <span>$5</span>
      <button className={s.checkoutButton}>
        ORDER
      </button>
    </div>
  );
};

export default Cart;
