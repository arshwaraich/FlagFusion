"use client";

import Board from "@/components/Board/Board";
import Cart from "@/components/Cart/Cart";
import Dock, { Actions } from "@/components/Dock/Dock";
import { StripeOutcomePopups } from "@/components/StripeOutcome/StripeOutcomePopups";
import { useState } from "react";

const [FROM, TO] = ['US', 'CA'];

export default function Home() {
  const [from, setFrom] = useState<string>(FROM);
  const [to, setTo] = useState<string>(TO);
  const [color, setColor] = useState<string>();
  const [reset, setReset] = useState<boolean>(false);
  const [showCart, setShowCart] = useState<boolean>(false);
  const [hasInteractedWithFlag, setHasInteractedWithFlag] = useState<boolean>(false);

  return (
    <>
      <StripeOutcomePopups />
      <Board
        from={from}
        reset={reset}
        color={color}
        onFlagInteraction={() => setHasInteractedWithFlag(true)} />
      <Dock
        from={from}
        setFrom={setFrom}
        to={to}
        setTo={setTo}
        color={color}
        setColor={setColor} />
      <Actions
        from={from}
        to={to}
        setShowCart={setShowCart}
        showBadge={hasInteractedWithFlag}
        resetFn={() => { setReset((i) => !i); setColor(undefined); }} />
      {
        showCart &&
        <Cart
          setShowCart={setShowCart}
        />
      }
    </>
  );
}
