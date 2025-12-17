import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import $axios from "../../services/api";
import type { AuthState } from "../../types";

type RegisterData = {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  phoneNumber: string;
  pid: string;
  address?: string;
  vehicle?: string;
  role: "admin" | "user" | "courier";
  workingDays?: any[];
  profileImage?: File | string | null;
};

interface LoginData {
  email: string;
  password: string;
  role: "admin" | "user" | "courier";
}

// ------------------- REGISTER -------------------
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const backendData = {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        phoneNumber: userData.phoneNumber,
        pid: userData.pid,
        address: userData.address,
        vehicle: userData.vehicle,
        workingDays: userData.workingDays,
        profileImage: userData.profileImage,
      };

      console.log("Sending registration request:", backendData);

      const response = await $axios.post(
        "http://localhost:5000/api/v1/auth/register",
        backendData
      );
      console.log("Register API response:", response.data);

      const userDataResponse = response.data;
      const user = userDataResponse.user;
      const accessToken = userDataResponse.credentials?.accessToken;

      if (accessToken && user) {
        if (
          userData.role === "courier" &&
          userData.workingDays &&
          accessToken
        ) {
          try {
            await $axios.post(
              "http://localhost:5000/api/v1/resource/couriers",
              {
                data: [
                  {
                    workingDays: userData.workingDays,
                    vehicle: userData.vehicle,
                    pid: userData.pid,
                    name: `${userData.firstName} ${userData.lastName}`,
                    email: userData.email,
                    userId: user.id,
                  },
                ],
              },
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            );

            console.log("Courier resource created");
          } catch (profileError: any) {
            const responseData = profileError.response?.data;
            console.error("Failed to create courier profile:", {
              messages: responseData?.message,
              fullError: responseData,
              status: profileError.response?.status,
            });

            if (Array.isArray(responseData?.message)) {
              console.log("Validation messages:");
              responseData.message.forEach((msg: string, index: number) =>
                console.log(`  ${index + 1}. ${msg}`)
              );
            }
          }
        }

        return {
          user: {
            ...user,
            role: userData.role,
            phoneNumber: userData.phoneNumber,
            pid: userData.pid,
            address: userData.address,
            vehicle: userData.vehicle,
            workingDays: userData.workingDays,
            profileImage: userData.profileImage,
          },
          token: accessToken,
        };
      }

      return { user: null, token: null };
    } catch (error: any) {
      console.error("Registration failed:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

// ------------------- LOGIN -------------------
export const loginUser = createAsyncThunk(
  "auth/login",
  async (loginData: LoginData, { rejectWithValue }) => {
    try {
      const response = await $axios.post(
        "http://localhost:5000/api/v1/auth/login",
        loginData
      );

      console.log(
        "Full user object structure:",
        JSON.stringify(response.data.user, null, 2)
      );

      const userData = response.data;
      const user = userData.user;
      const accessToken = userData.credentials?.accessToken;

      if (!accessToken) {
        throw new Error("No access token received");
      }

      return {
        user,
        token: accessToken,
        loginRole: loginData.role,
      };
    } catch (error: any) {
      console.error("Login API error:", error.response?.data);
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

// ------------------- STATE & SLICE -------------------
const initialState: AuthState = {
  user: null,
  users: [],
  token: null,
  isAuthenticated: false,
  role: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.role = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
    },

    initializeAuth: (state) => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          state.user = user;
          state.token = token;
          state.isAuthenticated = true;
          state.role = user.role;
        } catch (error) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Register ---
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.role = null;
        state.error = null;
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- Login ---
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { user, token, loginRole } = action.payload;

        let finalRole = user?.role;

        if (!finalRole) {
          finalRole = user?.userRole || user?.type || user?.roleType;
        }

        if (!finalRole) {
          finalRole = loginRole;
        }

        const completeUser = {
          ...user,
          role: finalRole,
          profileImage: user?.profileImage || "",
          pid: user?.pid || "",
          phoneNumber: user?.phoneNumber || "",
          address: user?.address || "",
          vehicle: user?.vehicle || "",
          workingDays: user?.workingDays || [],
        };

        state.loading = false;
        state.user = completeUser;
        state.token = token;
        state.isAuthenticated = true;
        state.role = finalRole;
        state.error = null;

        console.log("Saving to localStorage with role:", finalRole);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(completeUser));

        console.log("Final auth state:", {
          isAuthenticated: state.isAuthenticated,
          role: state.role,
          user: state.user,
        });
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, logout, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
