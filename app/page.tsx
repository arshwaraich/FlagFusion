"use client";

import Board from "@/components/Board/Board";
import Dock, { Actions } from "@/components/Dock/Dock";
import { useState } from "react";

const [FROM, TO] = ['US', 'CA'];

export default function Home() {
  const [from, setFrom] = useState<string>(FROM);
  const [to, setTo] = useState<string>(TO);
  const [color, setColor] = useState<string>();
  const [reset, setReset] = useState<boolean>(false);

  return (
    <>
      <Board
        from={from}
        reset={reset}
        color={color} />
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
        resetFn={() => setReset((i) => !i)}/>
    </>
  );
}
