"use client";

import { XMarkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import s from "@/components/StripeOutcome/Popup.module.scss";

export default function FailurePopup() {
  const handleClose = () => {
    window.location.href = "/";
  };
  return (
    <div className={s.popup}>
      <button className={s.closeButton} onClick={handleClose} title="Return Home">
        <XMarkIcon className={s.icon} />
      </button>
      <ExclamationTriangleIcon className={s.iconAlert} />
      <h1 className={s.heading}>Payment Failed</h1>
      <span className={s.message}>
        There was a problem processing your payment.<br />
        Please try again or <a href="mailto:orders@flagfusion.ca" className={s.supportLink}>contact support</a> if you need help.
      </span>
    </div>
  );
}
