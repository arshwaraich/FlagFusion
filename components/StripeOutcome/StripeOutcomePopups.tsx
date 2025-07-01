import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const SuccessPopup = dynamic(() => import("@/components/StripeOutcome/SuccessPopup"), { ssr: false });
const FailurePopup = dynamic(() => import("@/components/StripeOutcome/FailurePopup"), { ssr: false });

export function StripeOutcomePopups() {
  const pathname = usePathname();
  const [show, setShow] = useState(true);

  useEffect(() => {
    setShow(true);
  }, [pathname]);

  if (!show) return null;
  if (pathname === "/success") {
    return <SuccessPopup />;
  }
  if (pathname === "/failure") {
    return <FailurePopup />;
  }
  return null;
}
