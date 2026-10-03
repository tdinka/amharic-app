import type { MetadataRoute } from "next";

// Lets learners "Add to Home Screen" on their phone.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Learn Amharic",
    short_name: "Amharic",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF5EC",
    theme_color: "#FAF5EC",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
