/**
 * Simple in-memory cache with TTL support
 */
export class MemoryCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private ttl: number;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(ttl: number = 300000) { // Default 5 minutes
    this.ttl = ttl;
    this.startCleanup();
  }

  /**
   * Get value from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    entry.accessCount++;
    entry.lastAccessed = Date.now();
    return entry.value;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T, customTTL?: number): void {
    const ttl = customTTL ?? this.ttl;
    const expiresAt = Date.now() + ttl;

    this.cache.set(key, {
      value,
      expiresAt,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 0,
    });
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cached values
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const now = Date.now();
    const expired = entries.filter(entry => now > entry.expiresAt).length;
    const active = entries.length - expired;

    return {
      totalEntries: this.cache.size,
      activeEntries: active,
      expiredEntries: expired,
      totalAccessCount: entries.reduce((sum, entry) => sum + entry.accessCount, 0),
      hitRate: this.calculateHitRate(),
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  /**
   * Get all keys in cache (including expired)
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    return removedCount;
  }

  /**
   * Start automatic cleanup interval
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, Math.max(this.ttl / 10, 30000)); // Cleanup every 10% of TTL, minimum 30 seconds
  }

  /**
   * Stop automatic cleanup
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }

  /**
   * Calculate hit rate (rough estimation)
   */
  private calculateHitRate(): number {
    const entries = Array.from(this.cache.values());
    if (entries.length === 0) return 0;

    const totalAccesses = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    const uniqueKeys = entries.length;
    
    // Rough estimation: assumes each key was requested at least once
    return uniqueKeys > 0 ? totalAccesses / (totalAccesses + uniqueKeys) : 0;
  }

  /**
   * Estimate memory usage (rough calculation)
   */
  private estimateMemoryUsage(): number {
    let size = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      // Rough estimation of memory usage
      size += key.length * 2; // String overhead
      size += JSON.stringify(entry.value).length * 2; // Value serialization estimate
      size += 64; // Entry metadata overhead
    }

    return size;
  }

  /**
   * Destroy cache and cleanup resources
   */
  destroy(): void {
    this.stopCleanup();
    this.clear();
  }
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
  lastAccessed: number;
  accessCount: number;
}

interface CacheStats {
  totalEntries: number;
  activeEntries: number;
  expiredEntries: number;
  totalAccessCount: number;
  hitRate: number;
  memoryUsage: number;
}