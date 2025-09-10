import { useState, useEffect } from 'react';

const SMALL_SCREEN_QUERY = '(max-width: 768px)';

export function useIsSmallScreen(): boolean {
  const [isSmallScreen, setIsSmallScreen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(SMALL_SCREEN_QUERY).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQueryList = window.matchMedia(SMALL_SCREEN_QUERY);

    const listener = (event: MediaQueryListEvent) => {
      setIsSmallScreen(event.matches);
    };

    mediaQueryList.addEventListener('change', listener);

    return () => {
      mediaQueryList.removeEventListener('change', listener);
    };
  }, []);

  return isSmallScreen;
}
