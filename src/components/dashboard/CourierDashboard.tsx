import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import type { RootState } from "../../store";
import { courierAPI } from "../../services/api";
import type { User, TimeSlot, CourierResource } from "../../types";
import Navbar from "../Navbar";

const CourierDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [fullCourier, setFullCourier] = useState<User | null>(null);
  const [bookings, setBookings] = useState<TimeSlot[]>([]);
  const [otherCouriers, setOtherCouriers] = useState<CourierResource[]>([]);
  const courierUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (user?.id) {
      loadFullCourierInfo(user.id);
      loadBookings(user.id);
    }
    loadOtherCouriers();
  }, [user?.id]);

  const loadFullCourierInfo = async (userId: string) => {
    try {
      const response = await courierAPI.getCourierByUserId(userId);
      const data = response.data?.data || response.data;
      if (Array.isArray(data) && data.length > 0) {
        setFullCourier(data[0].data || data[0]);
      }
    } catch (error) {
      console.error("Error loading full courier info by userId:", error);
    }
  };

  const loadBookings = async (courierId: string) => {
    try {
      const response = await courierAPI.getCourierSchedule(courierId);
      setBookings(response.data);
    } catch (error) {
      console.error("Error loading bookings:", error);
    }
  };

  const loadOtherCouriers = async () => {
    try {
      const response = await courierAPI.getCouriers();
      let courierUsers: User[] = [];

      if (response && typeof response === "object") {
        const responseData = response as any;

        if (Array.isArray(responseData.data)) {
          courierUsers = responseData.data.map(
            (item: any) => item?.data || item
          );
        } else if (Array.isArray(responseData.data?.data)) {
          courierUsers = responseData.data.data.map(
            (item: any) => item?.data || item
          );
        } else if (Array.isArray(responseData)) {
          courierUsers = responseData.map((item: any) => item?.data || item);
        } else {
          console.warn(" Unexpected courier response shape:", response);
        }
      }

      const validCouriers = courierUsers.filter(
        (courier) =>
          courier &&
          (courier.id || courier.email) &&
          courier.userId !== user?.id
      );

      setOtherCouriers(validCouriers);
    } catch (error) {
      console.error("Error loading other couriers:", error);
      setOtherCouriers([]);
    }
  };

  const getTotalBookings = () => bookings.filter((b) => b.isBooked).length;
  console.log("fullCourier:", fullCourier);

  return (
    <>
      <Navbar />
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom>
          Courier Dashboard
        </Typography>
        {courierUser && (
          <Typography variant="h6" sx={{ mb: 3 }}>
            courier: {courierUser.firstName} {courierUser.lastName}
          </Typography>
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
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="start"
              >
                <Typography variant="h6" gutterBottom>
                  Your Information
                </Typography>

                <Button startIcon={<Edit />} variant="outlined" size="small">
                  Edit
                </Button>
              </Box>

              {fullCourier?.profileImage && (
                <Box
                  component="img"
                  src={
                    typeof fullCourier.profileImage === "string"
                      ? fullCourier.profileImage
                      : URL.createObjectURL(fullCourier.profileImage)
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

              <Typography>
                <strong>First Name:</strong> {fullCourier?.firstName}
              </Typography>
              <Typography>
                <strong>Last Name:</strong> {fullCourier?.lastName}
              </Typography>
              <Typography>
                <strong>PID:</strong> {fullCourier?.pid}
              </Typography>
              <Typography>
                <strong>Phone Number:</strong> {fullCourier?.phoneNumber}
              </Typography>
              <Typography>
                <strong>Email:</strong> {fullCourier?.email}
              </Typography>
              <Typography>
                <strong>Address:</strong> {fullCourier?.address}
              </Typography>
              <Typography>
                <strong>Vehicle:</strong> {fullCourier?.vehicle}
              </Typography>
              <Typography>
                <strong>Total Bookings:</strong> {getTotalBookings()}
              </Typography>
            </Paper>

            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Your Schedule
              </Typography>
              {fullCourier?.workingDays?.map((day, index) => (
                <Box
                  key={index}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Typography>{day.day}</Typography>
                  <Chip
                    label={`${day.startHours} - ${day.endHours}`}
                    size="small"
                    color="primary"
                  />
                </Box>
              ))}
            </Paper>
          </Box>

          <Box sx={{ width: { xs: "100%", md: "70%" } }}>
            <Typography variant="h5" gutterBottom>
              Your Bookings
            </Typography>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Time Slot</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>User</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((booking, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {booking.date
                          ? new Date(booking.date).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {booking.start} - {booking.end}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={booking.isBooked ? "Booked" : "Available"}
                          color={booking.isBooked ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{booking.userId || "Not booked"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              Other Couriers
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {otherCouriers.map((courier, idx) => (
                <Card key={`${courier.id || courier.email || idx}`}>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Box>
                        <Typography variant="h6">
                          {courier.name ||
                            `${courier.firstName} ${courier.lastName}`}
                        </Typography>

                        <Typography color="text.secondary">
                          Vehicle: {courier.vehicle || "N/A"}
                        </Typography>

                        <Box sx={{ mt: 1 }}>
                          {courier.workingDays?.map((day, di) => (
                            <Chip
                              key={di}
                              label={`${day.day}: ${day.startHours} - ${day.endHours}`}
                              size="small"
                              sx={{ mr: 1, mb: 1 }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}

              {otherCouriers.length === 0 && (
                <Typography>No other couriers available.</Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default CourierDashboard;
