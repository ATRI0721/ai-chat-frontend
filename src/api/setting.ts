// const BaseURL = "https://w4x4stmn-8000.asse.devtunnels.ms/api/v1";
const BaseURL = "http://localhost:8000/api/v1";

const api = {
  baseURL: BaseURL,
  headers: {
    "Content-Type": "application/json",
  },
  getToken: () => {
    const t = localStorage.getItem("token");
    if (!t) throw new Error("No token found");
    return t;
  },
  fetch: async <T>(url: string, options: RequestInit, withToken = true): Promise<T> => {
    const _options = {
      ...options,
      headers: {
        ...api.headers,
        Authorization: withToken? `Bearer ${api.getToken()}`: "",
      },
    };
    const response = await fetch(`${api.baseURL}${url}`, _options);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail);
    }
    return await response.json();
  },
  get: async <T>(url: string, withToken = true): Promise<T> => {
    return api.fetch<T>(url, { method: "GET" }, withToken);
  },
  post: async <T>(url: string, data: unknown, withToken = true): Promise<T> => {
    return api.fetch<T>(url, {
      method: "POST",
      body: JSON.stringify(data),
    }, withToken);
  },
  patch: async <T>(url: string, data: unknown, withToken = true): Promise<T> => {
    return api.fetch<T>(url, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, withToken);
  },
  delete: async <T>(url: string, withToken = true): Promise<T> => {
    return api.fetch<T>(url, { method: "DELETE" }, withToken);
  },
};

export default api;