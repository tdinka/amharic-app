import type { Metadata } from "next";
import { StudioPage } from "@/components/studio/StudioPage";

// Hidden from learners: not in the menu, and kept out of search engines.
export const metadata: Metadata = {
  title: "Recording studio · Learn Amharic",
  robots: { index: false, follow: false },
};

export default function Studio() {
  return <StudioPage />;
}
