"use client";

import dynamic from "next/dynamic";

const FailurePopup = dynamic(() => import("@/components/StripeOutcome/FailurePopup"), { ssr: false });

export default function FailurePage() {
  return <FailurePopup />;
}
