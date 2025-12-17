import React, { useState } from "react";
import { Box, Button, Alert } from "@mui/material";
import BaseFormElement from "./BaseFormElement";
import type { AdminFormData } from "../../types";

interface AdminFormProps {
  onSubmit: (data: AdminFormData) => void;
  loading?: boolean;
}

const AdminForm: React.FC<AdminFormProps> = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState<AdminFormData>({
    firstName: "",
    lastName: "",
    pid: "",
    phoneNumber: "",
    email: "",
    password: "",
    profileImage: null,
  });
  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;

    if (name === "profileImage" && files) {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        profileImage: file,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !formData.firstName ||
      !formData.pid ||
      !formData.phoneNumber ||
      !formData.email ||
      !formData.password
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (formData.pid.length !== 11) {
      setError("Personal ID must be 11 characters long");
      return;
    }

    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <BaseFormElement
        type="text"
        label="First Name *"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        required
      />

      <BaseFormElement
        type="text"
        label="Last Name"
        name="lastName"
        value={formData.lastName || ""}
        onChange={handleChange}
      />

      <BaseFormElement
        type="text"
        label="Personal ID (PID) *"
        name="pid"
        value={formData.pid}
        onChange={handleChange}
        required
        helperText="11-digit personal identification number"
      />

      <BaseFormElement
        type="text"
        label="Phone Number *"
        name="phoneNumber"
        value={formData.phoneNumber}
        onChange={handleChange}
        required
      />

      <BaseFormElement
        type="email"
        label="Email *"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <BaseFormElement
        type="password"
        label="Password *"
        name="password"
        value={formData.password}
        onChange={handleChange}
        required
        helperText="Minimum 6 characters"
      />

      <BaseFormElement
        type="file"
        label="Profile Image"
        name="profileImage"
        value={""}
        onChange={handleChange}
        helperText="Optional profile picture"
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3 }}
        disabled={loading}
      >
        {loading ? "Registering..." : "Register as Admin"}
      </Button>
    </Box>
  );
};

export default AdminForm;
