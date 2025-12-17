import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Container,
  CircularProgress,
  Alert,
} from "@mui/material";
import { registerUser } from "../../store/slices/authSlice";
import AdminForm from "./AdminForm";
import UserForm from "./UserForm";
import CourierForm from "./CourierForm";
import type { UserFormData, CourierFormData, AdminFormData } from "../../types";
import type { RootState, AppDispatch } from "../../store";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import { resourceAPI } from "../../services/api";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  ...other
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`registration-tabpanel-${index}`}
      aria-labelledby={`registration-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const RegistrationForm: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAdminSubmit = async (data: AdminFormData) => {
    try {
      const backendData = {
        ...data,
        role: "admin" as const,
      };
      await dispatch(registerUser(backendData)).unwrap();
      navigate("/login");
    } catch (error) {
      console.error("Admin registration failed:", error);
    }
  };

  const handleUserSubmit = async (data: UserFormData) => {
    try {
      const { password, ...cleanData } = data;

      const response = await dispatch(
        registerUser({
          ...data,
          role: "user" as const,
        })
      ).unwrap();

      console.log("registerUser response:", response);

      const accessToken = response.token;
      if (accessToken) {
        localStorage.setItem("token", accessToken);
      }

      const userResourceData = {
        firstName: cleanData.firstName,
        lastName: cleanData.lastName,
        email: cleanData.email,
        phoneNumber: cleanData.phoneNumber,
        pid: cleanData.pid,
        address: cleanData.address || "",
        profileImage: cleanData.profileImage || "",
      };

      console.log("Sending user resource data:", userResourceData);

      await resourceAPI.create("users", userResourceData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      navigate("/login");
    } catch (error) {
      console.error("User registration or resource creation failed:", error);
    }
  };

  const handleCourierSubmit = async (data: CourierFormData) => {
    try {
      const registerData = {
        firstName: data.firstName,
        lastName: data.lastName || "",
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber,
        pid: data.pid,
        role: "courier" as const,
        address: data.address || "",
        vehicle: data.vehicle || "",
        profileImage: data.profileImage,
        workingDays: data.workingDays || [],
      };

      await dispatch(registerUser(registerData)).unwrap();
      navigate("/login");
    } catch (error: any) {
      if (error.response) {
        console.error("Backend responded with:", error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Request setup error:", error.message);
      }
    }
  };

  return (
    <>
      <Navbar />

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, position: "relative" }}>
          {loading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 10,
              }}
            >
              <CircularProgress />
            </Box>
          )}

          <Typography
            variant="h3"
            align="center"
            gutterBottom
            color="primary"
            fontWeight="bold"
          >
            Create Account
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Choose your role and register
          </Typography>

          {isAuthenticated && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Registration successful! You can now login.
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab label="User" />
              <Tab label="Courier" />
              <Tab label="Admin" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <UserForm onSubmit={handleUserSubmit} loading={loading} />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <CourierForm onSubmit={handleCourierSubmit} loading={loading} />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <AdminForm onSubmit={handleAdminSubmit} loading={loading} />
          </TabPanel>
        </Paper>
      </Container>
    </>
  );
};

export default RegistrationForm;
