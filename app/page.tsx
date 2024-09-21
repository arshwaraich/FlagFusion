"use client";

import Board from "@/components/Board/Board";
import Dock, { Actions } from "@/components/Dock/Dock";
import { useState } from "react";

export const [FROM, TO] = ['SV', 'PE'];

export default function Home() {
  const [from, setFrom] = useState<string>(FROM);
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
        color={color}
        setColor={setColor} />
      <Actions
        resetFn={() => setReset((i) => !i)}/>
    </>
  );
}
