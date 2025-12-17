export interface User {
  id: string;
  name?: string;
  firstName: string;
  lastName?: string;
  pid: string;
  phoneNumber: string;
  email: string;
  password: string;
  profileImage?: string | File;
  role: "admin" | "user" | "courier";
  address?: string;
  vehicle?: string;
  workingDays?: WorkingDay[];
  createdAt: Date;
  updatedAt: Date;
  isVerified?: boolean;
  isActive?: boolean;
  userId?:string ;
}

export interface CourierResource {
  id: string;
  name?: string;
  firstName: string;
  lastName?: string;
  pid: string;
  phoneNumber: string;
  email: string;
  password: string;
  profileImage?: string | File;
  role: "admin" | "user" | "courier";
  address?: string;
  vehicle?: string;
  workingDays?: WorkingDay[];
  createdAt: Date;
  updatedAt: Date;
  isVerified?: boolean;
  isActive?: boolean;
}

export interface WorkingDay {
  id?: string;
  day: WeekDay;
  startHours: string;
  endHours: string;
  isActive?: boolean;
}

export type WeekDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface TimeSlot {
  id: string;
  start: string;
  end: string;
  courierId: string;
  userId?: string;
  isBooked: boolean;
  date: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  userId: string;
  courierId: string;
  timeSlot: TimeSlot;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  users: any[];
  token: string | null;
  isAuthenticated: boolean;
  role: "admin" | "user" | "courier" | null;
  loading: boolean;
  error: string | null; // Add this line
}

export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "select"
    | "file"
    | "time"
    | "day"
    | "number";
  required: boolean;
  options?: string[];
  validation?: any;
  placeholder?: string;
  disabled?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: string;
}

export interface BaseUserFormData {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  phoneNumber: string;
  pid: string;
  address?: string;
  profileImage?: File | string | null;
  vehicle?: string;
  workingDays?: WorkingDay[];
}

export interface UserFormData extends BaseUserFormData {
  address?: string;
  profileImage?: File | string | null;
}

export interface CourierFormData extends BaseUserFormData {
  vehicle?: string;
  workingDays?: WorkingDay[];
  profileImage?: File | string | null;
}

export interface AdminFormData extends BaseUserFormData {
  profileImage?: File | string | null;
}

export interface BackendAuthRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  phoneNumber?: string;
  pid?: string;
  address?: string;
  vehicle?: string;
}
