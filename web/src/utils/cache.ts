
interface CacheItem<T> {
    data: T;
    timestamp: number;
    expiry: number;
}

class Cache {
    private storage: Map<string, CacheItem<any>> = new Map();
    private defaultTTL: number = 5 * 60 * 1000; // 5 minutes

    set<T>(key: string, data: T, ttl?: number): void {
        const expiry = ttl || this.defaultTTL;
        const item: CacheItem<T> = {
            data,
            timestamp: Date.now(),
            expiry: Date.now() + expiry
        };
        this.storage.set(key, item);
    }

    get<T>(key: string): T | null {
        const item = this.storage.get(key);
        
        if (!item) {
            return null;
        }

        if (Date.now() > item.expiry) {
            this.storage.delete(key);
            return null;
        }

        return item.data;
    }

    has(key: string): boolean {
        const item = this.storage.get(key);
        
        if (!item) {
            return false;
        }

        if (Date.now() > item.expiry) {
            this.storage.delete(key);
            return false;
        }

        return true;
    }

    invalidate(key: string): void {
        this.storage.delete(key);
    }

    invalidatePattern(pattern: string): void {
        const regex = new RegExp(pattern);
        for (const key of this.storage.keys()) {
            if (regex.test(key)) {
                this.storage.delete(key);
            }
        }
    }

    clear(): void {
        this.storage.clear();
    }

    size(): number {
        return this.storage.size;
    }

    // Clean up expired items
    cleanup(): void {
        const now = Date.now();
        for (const [key, item] of this.storage.entries()) {
            if (now > item.expiry) {
                this.storage.delete(key);
            }
        }
    }
}

// Create a singleton instance
export const cache = new Cache();

// Auto cleanup every 10 minutes
setInterval(() => {
    cache.cleanup();
}, 10 * 60 * 1000);

// Cache key generators
export const cacheKeys = {
    marketData: (filters?: Record<string, any>) => 
        `market_data_${JSON.stringify(filters || {})}`,
    userProfile: (userId: string) => `user_profile_${userId}`,
    marketList: () => 'market_list',
    priceHistory: (market: string, product: string, timeframe: string) => 
        `price_history_${market}_${product}_${timeframe}`,
    notifications: (userId: string) => `notifications_${userId}`,
    settings: (userId: string) => `settings_${userId}`
};

export default cache;
