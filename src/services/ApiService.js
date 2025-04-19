// services/ApiService.js
class ApiService {
  constructor() {
    this.baseUrl = process.env.VUE_APP_MDV_BASE_URL;
  }

  async _fetchData(endpoint) {
    console.debug(`Fetching from: ${endpoint}`);
    
    const response = await fetch(endpoint);
    const data = await response.json();
    
    if (!response.ok) {
      console.error("API request failed:", data.message || 'Unknown error');
      throw new Error(data.message || 'Failed to fetch data');
    }
    
    return data;
  }

  async getHomeInfo(date) {
    const endpoint = `${this.baseUrl}/api/v1/info/${date}`;
    return this._fetchData(endpoint);
  }

  async getGospelWay(date) {
    const endpoint = `${this.baseUrl}/api/v1/gospel/${date}`;
    return this._fetchData(endpoint);
  }

  async getAllowedDates() {
    const endpoint = `${this.baseUrl}/api/v1/dates`;
    return this._fetchData(endpoint);
  }
}

export default new ApiService();