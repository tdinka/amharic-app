import type { Metadata } from "next";
import { ProgressPage } from "@/components/progress/ProgressPage";

export const metadata: Metadata = { title: "Progress · Learn Amharic" };

export default function Progress() {
  return <ProgressPage />;
}
