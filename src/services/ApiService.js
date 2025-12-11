// services/ApiService.js

class ApiService {
  constructor() {
    this.supabaseUrl = process.env.VUE_APP_SUPABASE_URL;
    this.anonKey = process.env.VUE_APP_SUPABASE_ANON_KEY;
    this.maxRetries = 3;
    this.baseDelay = 1000; // 1 second
  }

  /**
   * Sleep utility for retry delays
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Fetch with exponential backoff retry logic
   */
  async _fetchWithRetry(endpoint, retries = this.maxRetries) {
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(endpoint, {
          headers: {
            'apikey': this.anonKey,
            'Authorization': `Bearer ${this.anonKey}`
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          const errorMsg = data.message || data.error || `HTTP ${response.status}`;

          // Don't retry on 4xx errors (client errors)
          if (response.status >= 400 && response.status < 500) {
            throw new Error(errorMsg);
          }

          throw new Error(errorMsg);
        }

        return await response.json();

      } catch (error) {
        lastError = error;

        // Don't retry on abort or client errors
        if (error.name === 'AbortError') {
          console.warn(`Request timeout for: ${endpoint}`);
        }

        // Exponential backoff with jitter
        if (attempt < retries) {
          const delay = this.baseDelay * Math.pow(2, attempt) + Math.random() * 500;
          console.debug(`Retry ${attempt + 1}/${retries} for ${endpoint} in ${Math.round(delay)}ms`);
          await this._sleep(delay);
        }
      }
    }

    console.error(`API request failed after ${retries + 1} attempts:`, lastError?.message);
    throw lastError;
  }

  async getHomeInfo(date) {
    const endpoint = `${this.supabaseUrl}/functions/v1/gospel-info?date=${date}`;
    return this._fetchWithRetry(endpoint);
  }

  async getGospelWay(date) {
    const endpoint = `${this.supabaseUrl}/functions/v1/gospel-daily?date=${date}&version=2`;
    return this._fetchWithRetry(endpoint);
  }

  async getAllowedDates() {
    const endpoint = `${this.supabaseUrl}/functions/v1/gospel-dates`;
    return this._fetchWithRetry(endpoint);
  }

  async getRandomSeed() {
    const endpoint = `${this.supabaseUrl}/functions/v1/random-seed`;
    return this._fetchWithRetry(endpoint);
  }
}

export default new ApiService();
