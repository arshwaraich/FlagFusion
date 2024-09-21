"use client";

import Board from "@/components/Board/Board";
import Dock, { Actions } from "@/components/Dock/Dock";
import { useState } from "react";

export const [FROM, TO] = ['IN', 'CA'];

export default function Home() {
  const [from, setFrom] = useState<string>(FROM);
  const [color, setColor] = useState<string>();

  return (
    <>
      <Board
        from={from}
        color={color} />
      <Dock
        from={from}
        setFrom={setFrom}
        color={color}
        setColor={setColor} />
      <Actions />
    </>
  );
}
