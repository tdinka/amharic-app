import type { Metadata } from "next";
import { FidelExplorer } from "./FidelExplorer";

export const metadata: Metadata = { title: "Fidel explorer · Learn Amharic" };

export default function FidelPage() {
  return <FidelExplorer />;
}
