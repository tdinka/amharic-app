import type { Metadata } from "next";
import { Welcome } from "@/components/welcome/Welcome";

export const metadata: Metadata = { title: "Welcome · Learn Amharic" };

export default function WelcomePage() {
  return <Welcome />;
}
