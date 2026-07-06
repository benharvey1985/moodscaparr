const store = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(options: { interval: number; max: number }) {
  return {
    check: (key: string): { allowed: boolean; remaining: number; resetIn: number } => {
      const now = Date.now()
      const entry = store.get(key)

      if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + options.interval })
        return { allowed: true, remaining: options.max - 1, resetIn: options.interval }
      }

      entry.count++
      return {
        allowed: entry.count <= options.max,
        remaining: Math.max(0, options.max - entry.count),
        resetIn: entry.resetAt - now,
      }
    },
  }
}
