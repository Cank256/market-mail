
import React from 'react';

interface PerformanceMetric {
    name: string;
    value: number;
    timestamp: number;
    type: 'timing' | 'counter' | 'gauge';
}

class PerformanceMonitor {
    private metrics: PerformanceMetric[] = [];
    private observers: PerformanceObserver[] = [];

    constructor() {
        this.initializeObservers();
    }

    private initializeObservers() {
        // Observe navigation timing
        if ('PerformanceObserver' in window) {
            const navObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'navigation') {
                        const navEntry = entry as PerformanceNavigationTiming;
                        this.recordMetric('page_load_time', navEntry.loadEventEnd - navEntry.fetchStart, 'timing');
                        this.recordMetric('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.fetchStart, 'timing');
                        this.recordMetric('first_paint', navEntry.loadEventEnd - navEntry.fetchStart, 'timing');
                    }
                }
            });
            navObserver.observe({ entryTypes: ['navigation'] });
            this.observers.push(navObserver);

            // Observe resource timing
            const resourceObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'resource') {
                        const resourceEntry = entry as PerformanceResourceTiming;
                        this.recordMetric(`resource_${this.getResourceType(resourceEntry.name)}`, 
                            resourceEntry.responseEnd - resourceEntry.startTime, 'timing');
                    }
                }
            });
            resourceObserver.observe({ entryTypes: ['resource'] });
            this.observers.push(resourceObserver);

            // Observe largest contentful paint
            const lcpObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.recordMetric('largest_contentful_paint', entry.startTime, 'timing');
                }
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            this.observers.push(lcpObserver);

            // Observe first input delay
            const fidObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    const fidEntry = entry as any; // Type assertion for first-input entries
                    this.recordMetric('first_input_delay', fidEntry.processingStart - fidEntry.startTime, 'timing');
                }
            });
            fidObserver.observe({ entryTypes: ['first-input'] });
            this.observers.push(fidObserver);
        }
    }

    private getResourceType(url: string): string {
        if (url.includes('.js')) return 'javascript';
        if (url.includes('.css')) return 'stylesheet';
        if (url.includes('.png') || url.includes('.jpg') || url.includes('.svg')) return 'image';
        if (url.includes('/api/')) return 'api';
        return 'other';
    }

    recordMetric(name: string, value: number, type: PerformanceMetric['type'] = 'gauge') {
        const metric: PerformanceMetric = {
            name,
            value,
            timestamp: Date.now(),
            type
        };
        
        this.metrics.push(metric);
        
        // Keep only last 1000 metrics
        if (this.metrics.length > 1000) {
            this.metrics = this.metrics.slice(-1000);
        }

        // Log significant performance issues
        this.checkPerformanceThresholds(metric);
    }

    private checkPerformanceThresholds(metric: PerformanceMetric) {
        const thresholds = {
            page_load_time: 3000, // 3 seconds
            largest_contentful_paint: 2500, // 2.5 seconds
            first_input_delay: 100, // 100ms
            api_call: 1000 // 1 second
        };

        const threshold = thresholds[metric.name as keyof typeof thresholds];
        if (threshold && metric.value > threshold) {
            console.warn(`Performance threshold exceeded: ${metric.name} took ${metric.value}ms (threshold: ${threshold}ms)`);
        }
    }

    // Measure function execution time
    measureFunction<T>(name: string, fn: () => T): T {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        this.recordMetric(name, end - start, 'timing');
        return result;
    }

    // Measure async function execution time
    async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
        const start = performance.now();
        const result = await fn();
        const end = performance.now();
        this.recordMetric(name, end - start, 'timing');
        return result;
    }

    // Get metrics for analysis
    getMetrics(name?: string, since?: number): PerformanceMetric[] {
        let filtered = this.metrics;
        
        if (name) {
            filtered = filtered.filter(m => m.name === name);
        }
        
        if (since) {
            filtered = filtered.filter(m => m.timestamp >= since);
        }
        
        return filtered;
    }

    // Get performance summary
    getSummary(): Record<string, { avg: number; min: number; max: number; count: number }> {
        const summary: Record<string, { avg: number; min: number; max: number; count: number }> = {};
        
        for (const metric of this.metrics) {
            if (!summary[metric.name]) {
                summary[metric.name] = { avg: 0, min: Infinity, max: -Infinity, count: 0 };
            }
            
            const s = summary[metric.name];
            s.count++;
            s.min = Math.min(s.min, metric.value);
            s.max = Math.max(s.max, metric.value);
            s.avg = (s.avg * (s.count - 1) + metric.value) / s.count;
        }
        
        return summary;
    }

    // Memory usage monitoring
    getMemoryUsage(): any {
        if ('memory' in performance) {
            return (performance as any).memory;
        }
        return null;
    }

    // Clear all metrics
    clear() {
        this.metrics = [];
    }

    // Cleanup observers
    disconnect() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
    }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React Hook for performance monitoring
export function usePerformanceMonitor() {
    return {
        recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
        measureFunction: performanceMonitor.measureFunction.bind(performanceMonitor),
        measureAsyncFunction: performanceMonitor.measureAsyncFunction.bind(performanceMonitor),
        getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
        getSummary: performanceMonitor.getSummary.bind(performanceMonitor),
        getMemoryUsage: performanceMonitor.getMemoryUsage.bind(performanceMonitor)
    };
}

// Decorator for measuring component render time
export function withPerformanceTracking<P extends object>(
    Component: React.ComponentType<P>,
    componentName: string
) {
    return function PerformanceTrackedComponent(props: P) {
        const startTime = performance.now();
        
        React.useEffect(() => {
            const endTime = performance.now();
            performanceMonitor.recordMetric(`${componentName}_render_time`, endTime - startTime, 'timing');
        });
        
        return React.createElement(Component, props);
    };
}

export default performanceMonitor;
