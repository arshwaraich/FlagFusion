"use client";

import { XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import s from "@/components/StripeOutcome/Popup.module.scss";

export default function SuccessPopup() {
  const handleClose = () => {
    window.location.href = "/";
  };
  return (
    <div className={s.popup}>
      <button className={s.closeButton} onClick={handleClose} title="Return Home">
        <XMarkIcon className={s.icon} />
      </button>
      <CheckCircleIcon className={s.iconSuccess} />
      <h1 className={s.heading}>Thank you!</h1>
      <span className={s.message}>
        Your purchase was successful and is being processed.<br />
        You’ll receive a confirmation email soon.
      </span>
    </div>
  );
}
