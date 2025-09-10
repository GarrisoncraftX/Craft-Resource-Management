
import { useEffect } from 'react';

export const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 100) { // Log if render takes more than 100ms
        console.warn(`${componentName} took ${renderTime.toFixed(2)}ms to render`);
      }
    };
  }, [componentName]);

  useEffect(() => {
    // Monitor memory usage in development
    if (process.env.NODE_ENV === 'development') {
      const memory = (performance as any).memory;
      if (memory) {
        console.log(`${componentName} - Memory usage:`, {
          used: Math.round(memory.usedJSHeapSize / 1048576) + 'MB',
          total: Math.round(memory.totalJSHeapSize / 1048576) + 'MB'
        });
      }
    }
  }, [componentName]);
};
