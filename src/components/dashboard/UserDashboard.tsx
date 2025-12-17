import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  TextField,
} from "@mui/material";
import type { RootState } from "../../store";
import { courierAPI, userAPI } from "../../services/api";
import type { User, WorkingDay } from "../../types";
import Navbar from "../Navbar";

interface UserWithBooking extends User {
  booking?: {
    start: string;
    end: string;
    day: string;
    bookedBy: string;
  } | null;
}

const UserDashboard: React.FC = () => {
  const userProfile = useSelector((state: RootState) => state.auth.user);
  const currentUserEmail = userProfile?.email;

  const [couriers, setCouriers] = useState<UserWithBooking[]>([]);
  const [selectedCourier, setSelectedCourier] =
    useState<UserWithBooking | null>(null);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  const [editDialog, setEditDialog] = useState(false);
  const [editData, setEditData] = useState({
    firstName: userProfile?.firstName || "",
    lastName: userProfile?.lastName || "",
    phoneNumber: userProfile?.phoneNumber || "",
    email: userProfile?.email || "",
    address: userProfile?.address || "",
  });

  useEffect(() => {
    if (editDialog) firstFieldRef.current?.focus();
  }, [editDialog]);

  useEffect(() => {
    loadCouriers();
  }, []);

  const loadCouriers = async () => {
    try {
      const response = await courierAPI.getCouriers();
      const raw: any = response as any;
      const rawCouriers = raw?.data?.data || raw?.data || raw || [];

      const validCouriers = rawCouriers.map((item: any) => {
        const data = item?.data || {};
        return {
          id: item?.id || data?.id,
          resource: item?.resource,
          createdAt: item?.createdAt,
          updatedAt: item?.updatedAt,
          booking: item?.booking,
          ...data,
        };
      });

      setCouriers(validCouriers);
    } catch (error) {
      console.error("Error loading couriers:", error);
      setCouriers([]);
    }
  };

  const generateTimeSlots = (workingDay: WorkingDay) => {
    const slots: string[] = [];
    const start = parseInt(workingDay.startHours.split(":")[0]);
    const end = parseInt(workingDay.endHours.split(":")[0]);

    for (let hour = start; hour < end; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const isSlotBooked = (courier: UserWithBooking, time: string) => {
    return (
      courier.booking?.start === time && courier.booking?.day === selectedDay
    );
  };

  const userHasConflict = () => {
    return couriers.some(
      (c) =>
        c.id !== selectedCourier?.id &&
        c.booking?.bookedBy === currentUserEmail &&
        c.booking?.start === selectedTimeSlot &&
        c.booking?.day === selectedDay
    );
  };

  const add30Minutes = (time: string): string => {
    const [hours, minutes] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + 30;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, "0")}:${newMinutes
      .toString()
      .padStart(2, "0")}`;
  };

  const handleBookCourier = (courier: User) => {
    setSelectedCourier(courier);
    setBookingDialog(true);
    setSelectedTimeSlot("");
    setSelectedDay("");
  };

  const handleBookingSubmit = async () => {
    if (!selectedCourier?.id || !selectedTimeSlot || !selectedDay) return;

    if (userHasConflict()) {
      alert("You already have a booking at this time with another courier!");
      return;
    }

    try {
      await courierAPI.bookCourier(selectedCourier.id, selectedCourier, {
        start: selectedTimeSlot,
        end: add30Minutes(selectedTimeSlot),
        day: selectedDay,
        bookedBy: currentUserEmail,
      });

      setBookingSuccess(true);
      setBookingDialog(false);

      await loadCouriers();
      setTimeout(() => setBookingSuccess(false), 3000);
    } catch (error) {
      console.error("Booking failed:", error);
    }
  };

  const myBookings = couriers.filter(
    (c) => c.booking?.bookedBy === currentUserEmail
  );

  const handleSaveUserChanges = async () => {
    if (!userProfile) return;

    try {
      const updatedData = { ...editData };
      await userAPI.updateUser(Number(userProfile.id), { data: updatedData });
      setEditDialog(false);
      setEditData(updatedData);
      console.log("User updated successfully");
    } catch (err) {
      console.error("Failed to update user:", err);
    }
  };

  return (
    <>
      <Navbar />
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom>
          User Dashboard
        </Typography>

        {bookingSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Courier booked successfully!
          </Alert>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
          }}
        >
          <Box sx={{ width: { xs: "100%", md: "30%" } }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Your Information
              </Typography>
              <Button
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
                onClick={() => setEditDialog(true)}
              >
                Edit Information
              </Button>

              {userProfile?.profileImage && (
                <Box
                  component="img"
                  src={
                    typeof userProfile.profileImage === "string"
                      ? userProfile.profileImage
                      : URL.createObjectURL(userProfile.profileImage)
                  }
                  alt="Profile"
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    objectFit: "cover",
                    mb: 2,
                  }}
                />
              )}

              {userProfile ? (
                <>
                  <Typography>
                    <strong>FirstName:</strong>{" "}
                    {userProfile.firstName || "<no name>"}
                  </Typography>
                  <Typography>
                    <strong>LastName:</strong>{" "}
                    {userProfile.lastName || "<no name>"}
                  </Typography>
                  <Typography>
                    <strong>PID:</strong> {userProfile.pid || "<no pid>"}
                  </Typography>
                  <Typography>
                    <strong>Phone:</strong>{" "}
                    {userProfile.phoneNumber || "<no phone>"}
                  </Typography>
                  <Typography>
                    <strong>Email:</strong> {userProfile.email || "<no email>"}
                  </Typography>
                  <Typography>
                    <strong>Address:</strong>{" "}
                    {userProfile.address || "<no address>"}
                  </Typography>
                </>
              ) : (
                <Typography color="error">
                  No user profile found. Please log in.
                </Typography>
              )}
            </Paper>
          </Box>

          <Box sx={{ width: { xs: "100%", md: "70%" } }}>
            <Typography variant="h5" gutterBottom>
              Available Couriers
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {couriers.map((courier) => (
                <Card key={courier.id}>
                  <CardContent
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Box>
                      <Typography variant="h6">{courier.name}</Typography>
                      <Typography color="text.secondary">
                        Vehicle: {courier.vehicle || "N/A"}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {courier.workingDays?.map((day, idx) => (
                          <Chip
                            key={idx}
                            label={`${day.day}: ${day.startHours} - ${day.endHours}`}
                            size="small"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))}
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      onClick={() => handleBookCourier(courier)}
                    >
                      Book Courier
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {couriers.length === 0 && (
                <Typography>No couriers available.</Typography>
              )}
            </Box>

            {myBookings.length > 0 && (
              <Box sx={{ mt: 5 }}>
                <Typography variant="h5" gutterBottom>
                  My Booked Couriers
                </Typography>
                {myBookings.map((courier) => (
                  <Card key={courier.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6">{courier.name}</Typography>
                      <Typography>Vehicle: {courier.vehicle}</Typography>
                      <Typography>
                        Booking Day: {courier.booking?.day} <br />
                        Booking Time: {courier.booking?.start} -{" "}
                        {courier.booking?.end}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        </Box>

        <Dialog
          open={editDialog}
          onClose={() => setEditDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Edit Your Information</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
          >
            <TextField
              inputRef={firstFieldRef}
              label="First Name"
              value={editData.firstName}
              onChange={(e) =>
                setEditData({ ...editData, firstName: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Last Name"
              value={editData.lastName}
              onChange={(e) =>
                setEditData({ ...editData, lastName: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Phone Number"
              value={editData.phoneNumber}
              onChange={(e) =>
                setEditData({ ...editData, phoneNumber: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={editData.email}
              onChange={(e) =>
                setEditData({ ...editData, email: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Address"
              value={editData.address}
              onChange={(e) =>
                setEditData({ ...editData, address: e.target.value })
              }
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveUserChanges}>
              Save
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={bookingDialog}
          onClose={() => setBookingDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Book Courier: {selectedCourier?.name}</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Select Day</InputLabel>
              <Select
                value={selectedDay}
                label="Select Day"
                onChange={(e) => setSelectedDay(e.target.value)}
              >
                {selectedCourier?.workingDays?.map((day) => (
                  <MenuItem key={day.day} value={day.day}>
                    {day.day}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Select Time Slot</InputLabel>
              <Select
                value={selectedTimeSlot}
                label="Select Time Slot"
                onChange={(e) => setSelectedTimeSlot(e.target.value)}
              >
                {selectedCourier?.workingDays
                  ?.filter((day) => day.day === selectedDay)
                  .flatMap((day) =>
                    generateTimeSlots(day).map((time) => (
                      <MenuItem
                        key={`${day.day}-${time}`}
                        value={time}
                        disabled={isSlotBooked(selectedCourier, time)}
                      >
                        {time}{" "}
                        {isSlotBooked(selectedCourier, time) ? "(Booked)" : ""}
                      </MenuItem>
                    ))
                  )}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBookingDialog(false)}>Cancel</Button>
            <Button
              onClick={handleBookingSubmit}
              variant="contained"
              disabled={
                selectedTimeSlot === "" ||
                selectedDay === "" ||
                userHasConflict()
              }
            >
              Confirm Booking
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default UserDashboard;
