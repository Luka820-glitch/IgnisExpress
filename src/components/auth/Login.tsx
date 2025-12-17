import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import { loginUser } from "../../store/slices/authSlice";
import { createValidation } from "../../utils/validation";
import type { RootState, AppDispatch } from "../../store";
import Navbar from "../Navbar";

interface LoginForm {
  email: string;
  password: string;
  role: "admin" | "user" | "courier";
}

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const { loading, error, isAuthenticated, role, user } = useSelector(
    (state: RootState) => state.auth
  );

  const navigateBasedOnRole = (userRole: string) => {
    switch (userRole) {
      case "admin":
        navigate("/admin", { replace: true });
        break;
      case "courier":
        navigate("/courier", { replace: true });
        break;
      case "user":
        navigate("/user", { replace: true });
        break;
      default:
        navigate("/", { replace: true });
    }
  };
  useEffect(() => {
    console.log("FULL Auth state:", {
      isAuthenticated,
      role,
      user,
      loading,
      error,
      hasToken: !!localStorage.getItem("token"),
      storedUser: localStorage.getItem("user"),
    });

    if (isAuthenticated) {
      console.log(" checking role:", role);
      console.log("Full user object:", user);

      if (role) {
        switch (role) {
          case "admin":
            navigate("/admin", { replace: true });
            break;
          case "courier":
            navigate("/courier", { replace: true });
            break;
          case "user":
            navigate("/user", { replace: true });
            break;
          default:
            navigate("/", { replace: true });
        }
      } else {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);

            if (parsedUser.role) {
              navigateBasedOnRole(parsedUser.role);
            }
          } catch (e) {
            console.error("Error parsing stored user:", e);
          }
        }
      }
    }
  }, [isAuthenticated, role, navigate, user]);

  const onSubmit = async (data: LoginForm) => {
    try {
      await dispatch(loginUser(data)).unwrap();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <>
      <Navbar />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Paper sx={{ p: 4, width: 400 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Login
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.role}>
              <InputLabel>Role *</InputLabel>
              <Select
                {...register("role", createValidation("role", true))}
                label="Role *"
                defaultValue=""
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="courier">Courier</MenuItem>
              </Select>
              {errors.role && (
                <Typography color="error" variant="caption">
                  {errors.role.message}
                </Typography>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="Email *"
              type="email"
              {...register("email", createValidation("email", true))}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Password *"
              type="password"
              {...register("password", createValidation("password", true))}
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default Login;
