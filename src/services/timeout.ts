export interface TimeoutOptions {
  timeoutMs?: number;
  retries?: number;
}

export async function withTimeout<T>(promise: Promise<T>, timeoutMs = 30000, retries = 0): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await Promise.race([promise, new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`Timeout después de ${timeoutMs}ms`)), timeoutMs))]);
    } catch (error) {
      lastError = error as Error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 100 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError || new Error('Operación fallida');
}
