"use client";

import dynamic from "next/dynamic";

const SuccessPopup = dynamic(() => import("@/components/StripeOutcome/SuccessPopup"), { ssr: false });

export default function SuccessPage() {
  return <SuccessPopup />;
}
