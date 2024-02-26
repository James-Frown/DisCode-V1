import { useEffect, useState } from "react";

export const useOrigin = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isBrowser = typeof window !== "undefined";

  const origin = isBrowser ? window.location.origin : "";

  if (!mounted) {
    return "";
  }

  return origin;
};
