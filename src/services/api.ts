import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import type { User, WorkingDay } from "../types";

export interface CourierResource {
  id: string;
  resource: string;
  data: User;
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL = "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const resourceAPI = {
  getAll: (resource: string, config = {}) =>
    api.get(`/resource/${resource}`, config),

  getCouriers: (): Promise<AxiosResponse<CourierResource[]>> =>
    api.get("/resource/couriers", {
      headers: { "Cache-Control": "no-cache" },
    }),

  getById: (resource: string, id: string) =>
    api.get(`/resource/${resource}/${id}`),

  create: (resource: string, data: any, config?: AxiosRequestConfig) => {
    return axios.post(
      `http://localhost:5000/api/v1/resource/${resource}`,
      data,
      config
    );
  },

  update: (resource: string, id: string, data: any) =>
    api.put(`/resource/${resource}/${id}`, data),

  delete: (resource: string, id: string) =>
    api.delete(`/resource/${resource}/${id}`),
};

export const authAPI = {
  login: (email: string, password: string, role: string) =>
    api.post("/auth/login", { email, password, role }),
  register: (userData: Partial<User>) => api.post("/auth/register", userData),
};

export const courierAPI = {
  getCouriers: (): Promise<AxiosResponse<CourierResource[]>> =>
    api.get("/resource/couriers"),

  getCourierById: (id: string) => api.get(`/resource/couriers/${id}`),
  createCourier: (courierData: Partial<User>) =>
    resourceAPI.create("/resource/couriers", courierData),
  updateCourier: (id: string, courierData: Partial<User>) =>
    resourceAPI.update("/resource/couriers", id, courierData),

  deleteCourier: (id: string) => api.delete(`resource/couriers/${id}`),

  getCourierSchedule: (courierId: string) =>
    api.get(`couriers/${courierId}/bookings`),

  getCourierByUserId: (userId: string) => api.get(`/couriers?userId=${userId}`),

  bookCourier: (courierId: string, courier: any, bookingData: any) =>
    api.put(`/resource/couriers/${courierId}`, {
      data: {
        ...courier,
        isAvailable: false,
        booking: bookingData,
      },
    }),

  updateWorkingDays: (courierId: string, workingDays: WorkingDay[]) =>
    api.put(`/couriers/${courierId}/working-days`, { workingDays }),
  getAvailableTimeSlots: (courierId: string) =>
    api.get(`/couriers/${courierId}/available-slots`),
  cancelBooking: (bookingId: string) => api.delete(`/bookings/${bookingId}`),
  getCourierBookings: (courierId: string) =>
    api.get(`/couriers/${courierId}/bookings`),
};

export const userAPI = {
  getUsers: () => resourceAPI.getAll("users"),
  getUserById: (id: string) => resourceAPI.getById("users", id),

  createUser: (userData: Partial<User>) =>
    axios.post(`${API_BASE_URL}/users`, userData),

  updateUser: (id: number, payload: any) => {
    return api.put(`${API_BASE_URL}/resource/users/${id}`, payload);
  },

  deleteUser: (id: string) => resourceAPI.delete("users", id),
};

export default api;
