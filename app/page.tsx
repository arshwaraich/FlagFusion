import Board from "@/components/Board/Board";
import Dock, { Actions } from "@/components/Dock/Dock";

export default function Home() {
  return (
    <>
      <Board />
      <Dock />
      <Actions />
    </>
  );
}
