import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { User, TimeSlot, WorkingDay } from "../../types";
import { courierAPI, type CourierResource } from "../../services/api";

interface CourierState {
  couriers: User[];
  currentCourier: User | null;
  courierSchedule: TimeSlot[];
  availableTimeSlots: TimeSlot[];
  loading: boolean;
  error: string | null;
  bookingLoading: boolean;
}

const initialState: CourierState = {
  couriers: [],
  currentCourier: null,
  courierSchedule: [],
  availableTimeSlots: [],
  loading: false,
  error: null,
  bookingLoading: false,
};

export const fetchCouriers = createAsyncThunk(
  "couriers/fetchCouriers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await courierAPI.getCouriers();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch couriers"
      );
    }
  }
);

export const fetchCourierById = createAsyncThunk(
  "couriers/fetchCourierById",
  async (courierId: string, { rejectWithValue }) => {
    try {
      const response = await courierAPI.getCourierById(courierId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch courier"
      );
    }
  }
);

export const updateCourier = createAsyncThunk(
  "couriers/updateCourier",
  async (
    { id, courierData }: { id: string; courierData: Partial<User> },
    { rejectWithValue }
  ) => {
    try {
      const response = await courierAPI.updateCourier(id, courierData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update courier"
      );
    }
  }
);

export const deleteCourier = createAsyncThunk(
  "couriers/deleteCourier",
  async (courierId: string, { rejectWithValue }) => {
    try {
      await courierAPI.deleteCourier(courierId);
      return courierId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete courier"
      );
    }
  }
);

export const fetchCourierSchedule = createAsyncThunk(
  "couriers/fetchSchedule",
  async (courierId: string, { rejectWithValue }) => {
    try {
      const response = await courierAPI.getCourierSchedule(courierId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch schedule"
      );
    }
  }
);

export const bookCourier = createAsyncThunk(
  "couriers/bookCourier",
  async (
    {
      courierId,
      courier,
      timeSlot,
    }: {
      courierId: string;
      courier: any;
      timeSlot: { start: string; end: string };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await courierAPI.bookCourier(
        courierId,
        courier,
        timeSlot
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to book courier"
      );
    }
  }
);

export const fetchCourierByUserId = createAsyncThunk(
  "couriers/fetchCourierByUserId",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await courierAPI.getCourierByUserId(userId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch courier by user ID"
      );
    }
  }
);

export const updateWorkingDays = createAsyncThunk(
  "couriers/updateWorkingDays",
  async (
    {
      courierId,
      workingDays,
    }: { courierId: string; workingDays: WorkingDay[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await courierAPI.updateWorkingDays(
        courierId,
        workingDays
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update working days"
      );
    }
  }
);

export const getAvailableTimeSlots = createAsyncThunk(
  "couriers/getAvailableTimeSlots",
  async (courierId: string, { rejectWithValue }) => {
    try {
      const response = await courierAPI.getAvailableTimeSlots(courierId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get available time slots"
      );
    }
  }
);

export const cancelBooking = createAsyncThunk(
  "couriers/cancelBooking",
  async (bookingId: string, { rejectWithValue }) => {
    try {
      await courierAPI.cancelBooking(bookingId);
      return bookingId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to cancel booking"
      );
    }
  }
);

const courierSlice = createSlice({
  name: "couriers",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentCourier: (state, action: PayloadAction<User>) => {
      state.currentCourier = action.payload;
    },
    clearCurrentCourier: (state) => {
      state.currentCourier = null;
    },
    updateCourierProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentCourier) {
        state.currentCourier = { ...state.currentCourier, ...action.payload };
      }
    },
    addTimeSlot: (state, action: PayloadAction<TimeSlot>) => {
      state.courierSchedule.push(action.payload);
    },
    removeTimeSlot: (state, action: PayloadAction<string>) => {
      state.courierSchedule = state.courierSchedule.filter(
        (slot) => slot.id !== action.payload
      );
    },
    clearSchedule: (state) => {
      state.courierSchedule = [];
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchCouriers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCouriers.fulfilled, (state, action) => {
        state.loading = false;
        state.couriers = action.payload.map(
          (resource: CourierResource) => resource.data
        );
      })
      .addCase(fetchCouriers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchCourierById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourierById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourier = action.payload;
      })
      .addCase(fetchCourierById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateCourier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourier.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCourier = action.payload;
        state.currentCourier = updatedCourier;

        const index = state.couriers.findIndex(
          (courier) => courier.id === updatedCourier.id
        );
        if (index !== -1) {
          state.couriers[index] = updatedCourier;
        }
      })
      .addCase(updateCourier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteCourier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCourier.fulfilled, (state, action) => {
        state.loading = false;
        state.couriers = state.couriers.filter(
          (courier) => courier.id !== action.payload
        );

        if (state.currentCourier?.id === action.payload) {
          state.currentCourier = null;
        }
      })
      .addCase(deleteCourier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchCourierSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourierSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.courierSchedule = action.payload;
      })
      .addCase(fetchCourierSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(bookCourier.pending, (state) => {
        state.bookingLoading = true;
        state.error = null;
      })
      .addCase(bookCourier.fulfilled, (state, action) => {
        state.bookingLoading = false;

        const bookedSlot = action.payload;
        const index = state.courierSchedule.findIndex(
          (slot) => slot.id === bookedSlot.id
        );
        if (index !== -1) {
          state.courierSchedule[index] = bookedSlot;
        }
      })
      .addCase(bookCourier.rejected, (state, action) => {
        state.bookingLoading = false;
        state.error = action.payload as string;
      })

      .addCase(updateWorkingDays.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWorkingDays.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentCourier) {
          state.currentCourier.workingDays = action.payload.workingDays;
        }
      })
      .addCase(updateWorkingDays.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getAvailableTimeSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAvailableTimeSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.availableTimeSlots = action.payload;
      })
      .addCase(getAvailableTimeSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.courierSchedule = state.courierSchedule.map((slot) =>
          slot.id === action.payload
            ? { ...slot, isBooked: false, userId: undefined }
            : slot
        );
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCourierByUserId.fulfilled, (state, action) => {
        state.currentCourier = action.payload;
      })
      .addCase(fetchCourierByUserId.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setCurrentCourier,
  clearCurrentCourier,
  updateCourierProfile,
  addTimeSlot,
  removeTimeSlot,
  clearSchedule,
} = courierSlice.actions;

export default courierSlice.reducer;
