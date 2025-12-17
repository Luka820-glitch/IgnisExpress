import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import { userAPI, courierAPI, type CourierResource } from "../../services/api";
import type { User } from "../../types";
import Navbar from "../Navbar";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

const AdminDashboard: React.FC = () => {
  const adminUser = useSelector((state: RootState) => state.auth.user);
  const [users, setUsers] = useState<User[]>([]);
  const [couriers, setCouriers] = useState<CourierResource[]>([]);
  const [selectedUser, setSelectedUser] = useState<
    User | CourierResource["data"] | null
  >(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    loadUsers();
    loadCouriers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userAPI.getUsers();
      console.log("Users response data:", response);

      setUsers(response.data.users || response.data.data || response.data);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadCouriers = async () => {
    try {
      const response = await courierAPI.getCouriers();
      console.log("Couriers response:", response);
      setCouriers(response.data);
    } catch (error) {
      console.error("Error loading couriers:", error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await userAPI.deleteUser(id);
      loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleDeleteCourier = async (courierResourceId: string) => {
    try {
      await courierAPI.deleteCourier(courierResourceId);
      loadCouriers();
    } catch (error) {
      console.error("Error deleting courier:", error);
    }
  };

  const handleViewUser = (user: User | CourierResource["data"]) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  return (
    <>
      <Navbar />
      <Box p={3}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        {adminUser && (
          <Typography variant="h6" sx={{ mb: 3 }}>
            Admin: {adminUser.firstName} {adminUser.lastName}
          </Typography>
        )}

        <Box mb={4}>
          <Typography variant="h5" gutterBottom>
            Users
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Photo</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.profileImage instanceof File ? (
                        <img
                          src={URL.createObjectURL(user.profileImage)}
                          alt={user.firstName}
                          width={40}
                          height={40}
                          style={{ borderRadius: "50%" }}
                        />
                      ) : (
                        <img
                          src={user.profileImage || ""}
                          alt={user.firstName}
                          width={40}
                          height={40}
                          style={{ borderRadius: "50%" }}
                        />
                      )}
                    </TableCell>

                    <TableCell>{`${user.firstName} ${
                      user.lastName || ""
                    }`}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phoneNumber}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={
                          user.role === "admin"
                            ? "error"
                            : user.role === "courier"
                            ? "warning"
                            : "primary"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleViewUser(user)}>
                        <Visibility />
                      </IconButton>
                      <IconButton>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteUser(user.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box>
          <Typography variant="h5" gutterBottom>
            Couriers
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Working Days</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {couriers.map((courier) => (
                  <TableRow key={courier.id}>
                    <TableCell>
                      {courier.data.firstName
                        ? `${courier.data.firstName} ${
                            courier.data.lastName || ""
                          }`
                        : courier.data.name || "N/A"}
                    </TableCell>
                    <TableCell>{courier.data.vehicle}</TableCell>
                    <TableCell>
                      {courier.data.workingDays?.length || 0}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleViewUser(courier.data)}>
                        <Visibility />
                      </IconButton>
                      <IconButton>
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteCourier(courier.id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedUser?.role === "courier"
              ? "Courier Details"
              : "User Details"}
          </DialogTitle>
          <DialogContent>
            {selectedUser && (
              <Box>
                <Typography>
                  <strong>Name:</strong>{" "}
                  {selectedUser.firstName
                    ? `${selectedUser.firstName} ${selectedUser.lastName || ""}`
                    : selectedUser.name || "N/A"}
                </Typography>
                {selectedUser.pid && (
                  <Typography>
                    <strong>Personal ID:</strong> {selectedUser.pid}
                  </Typography>
                )}
                {selectedUser.vehicle && (
                  <Typography>
                    <strong>Vehicle:</strong> {selectedUser.vehicle}
                  </Typography>
                )}
                {selectedUser.address && (
                  <Typography>
                    <strong>Address:</strong> {selectedUser.address}
                  </Typography>
                )}
                {selectedUser.workingDays &&
                  selectedUser.workingDays.length > 0 && (
                    <Box mt={2}>
                      <Typography>
                        <strong>Working Schedule:</strong>
                      </Typography>
                      {selectedUser.workingDays.map((day, index) => (
                        <Typography key={index} variant="body2">
                          {day.day}: {day.startHours} - {day.endHours}
                        </Typography>
                      ))}
                    </Box>
                  )}
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </>
  );
};

export default AdminDashboard;
