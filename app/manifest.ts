import type { MetadataRoute } from "next";

// Lets learners "Add to Home Screen" on their phone.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Learn Amharic",
    short_name: "Amharic",
    start_url: "/",
    display: "standalone",
    background_color: "#E9E1CE",
    theme_color: "#E9E1CE",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
