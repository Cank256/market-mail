
import { MarketPrice, PriceItem } from '../types';

// Mock data generators for testing
export const generateMockMarketPrice = (overrides?: Partial<MarketPrice>): MarketPrice => {
  const markets = ['Nakasero Market', 'Owino Market', 'Kalerwe Market', 'Wandegeya Market'];
  const products = ['Tomatoes', 'Onions', 'Irish Potatoes', 'Bananas', 'Maize', 'Beans'];
  const units = ['kg', 'bunch', 'piece'];
  
  const randomMarket = markets[Math.floor(Math.random() * markets.length)];
  const randomDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
  
  const priceItems: PriceItem[] = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => ({
    product: products[Math.floor(Math.random() * products.length)],
    unit: units[Math.floor(Math.random() * units.length)],
    price: Math.floor(Math.random() * 10000) + 1000
  }));

  return {
    _id: Math.random().toString(36).substr(2, 9),
    market: randomMarket,
    date: randomDate.toISOString().split('T')[0],
    submitterEmail: `trader@${randomMarket.toLowerCase().replace(' ', '')}.com`,
    priceItems,
    ...overrides
  };
};

export const generateMockMarketData = (count: number): MarketPrice[] => {
  return Array.from({ length: count }, () => generateMockMarketPrice());
};

// Performance testing utilities
export class PerformanceTester {
  private tests: { name: string; duration: number; memory?: number }[] = [];

  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();
    
    const result = await fn();
    
    const endTime = performance.now();
    const endMemory = this.getMemoryUsage();
    
    this.tests.push({
      name,
      duration: endTime - startTime,
      memory: endMemory && startMemory ? endMemory.usedJSHeapSize - startMemory.usedJSHeapSize : undefined
    });
    
    return result;
  }

  measure<T>(name: string, fn: () => T): T {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();
    
    const result = fn();
    
    const endTime = performance.now();
    const endMemory = this.getMemoryUsage();
    
    this.tests.push({
      name,
      duration: endTime - startTime,
      memory: endMemory && startMemory ? endMemory.usedJSHeapSize - startMemory.usedJSHeapSize : undefined
    });
    
    return result;
  }

  private getMemoryUsage(): any {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  }

  getResults() {
    return this.tests;
  }

  getReport() {
    const totalTime = this.tests.reduce((sum, test) => sum + test.duration, 0);
    const avgTime = totalTime / this.tests.length;
    
    return {
      totalTests: this.tests.length,
      totalTime,
      averageTime: avgTime,
      slowestTest: this.tests.reduce((prev, current) => 
        prev.duration > current.duration ? prev : current
      ),
      fastestTest: this.tests.reduce((prev, current) => 
        prev.duration < current.duration ? prev : current
      ),
      tests: this.tests
    };
  }

  clear() {
    this.tests = [];
  }
}

// Component testing utilities
export const waitForElement = async (selector: string, timeout = 5000): Promise<Element> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkElement = () => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        return;
      }
      
      requestAnimationFrame(checkElement);
    };
    
    checkElement();
  });
};

export const waitForCondition = async (condition: () => boolean, timeout = 5000): Promise<void> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkCondition = () => {
      if (condition()) {
        resolve();
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        reject(new Error(`Condition not met within ${timeout}ms`));
        return;
      }
      
      requestAnimationFrame(checkCondition);
    };
    
    checkCondition();
  });
};

// Data validation utilities
export const validateMarketPrice = (data: any): data is MarketPrice => {
  return (
    typeof data === 'object' &&
    typeof data._id === 'string' &&
    typeof data.market === 'string' &&
    typeof data.date === 'string' &&
    typeof data.submitterEmail === 'string' &&
    Array.isArray(data.priceItems) &&
    data.priceItems.every((item: any) => 
      typeof item.product === 'string' &&
      typeof item.unit === 'string' &&
      typeof item.price === 'number'
    )
  );
};

export const validateMarketData = (data: any[]): data is MarketPrice[] => {
  return Array.isArray(data) && data.every(validateMarketPrice);
};

// Error simulation for testing
export const simulateNetworkError = (probability = 0.1): Promise<never> | Promise<void> => {
  if (Math.random() < probability) {
    return Promise.reject(new Error('Simulated network error'));
  }
  return Promise.resolve();
};

export const simulateSlowNetwork = (delay = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Local storage testing utilities
export const mockLocalStorage = () => {
  const storage: Record<string, string> = {};
  
  return {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => {
      storage[key] = value;
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
    clear: () => {
      Object.keys(storage).forEach(key => delete storage[key]);
    },
    length: Object.keys(storage).length,
    key: (index: number) => Object.keys(storage)[index] || null
  };
};

export default {
  generateMockMarketPrice,
  generateMockMarketData,
  PerformanceTester,
  waitForElement,
  waitForCondition,
  validateMarketPrice,
  validateMarketData,
  simulateNetworkError,
  simulateSlowNetwork,
  mockLocalStorage
};
