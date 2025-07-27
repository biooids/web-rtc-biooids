// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// This function is used everywhere to combine Tailwind CSS classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This function is used in your forms to get a clean error message
export const getApiErrorMessage = (error: any): string => {
  if (error?.data?.message) {
    return error.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return "An unknown error occurred. Please try again.";
};

// This function is used in your PostCard to format large numbers
export function formatCompactNumber(number: number) {
  if (number < 1000) {
    return number.toString();
  }
  if (number < 1000000) {
    return (number / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  if (number < 1000000000) {
    return (number / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  return (number / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
}

/**
 * Converts a standard video URL (YouTube, Vimeo) into a valid embed URL for iframes.
 * @param url The original video URL from the user.
 * @returns A valid embed URL or null if the URL is not recognized or invalid.
 */
export const getEmbedUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;

  try {
    const urlObject = new URL(url);
    let videoId: string | null = null;

    // Handle standard YouTube URLs (e.g., https://www.youtube.com/watch?v=...)
    if (
      urlObject.hostname.includes("youtube.com") &&
      urlObject.searchParams.has("v")
    ) {
      videoId = urlObject.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    // Handle short YouTube URLs (e.g., https://youtu.be/...)
    if (urlObject.hostname.includes("youtu.be")) {
      videoId = urlObject.pathname.slice(1);
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    // Handle Vimeo URLs (e.g., https://vimeo.com/...)
    if (urlObject.hostname.includes("vimeo.com")) {
      videoId = urlObject.pathname.split("/").pop() ?? null;
      if (videoId) return `https://player.vimeo.com/video/${videoId}`;
    }

    // Return null if no supported platform is detected
    return null;
  } catch (error) {
    // This will catch invalid URLs that can't be parsed
    console.error("Invalid URL provided for embedding:", url, error);
    return null;
  }
};
