import React, { useState } from "react";
import { Box, Button, Alert } from "@mui/material";
import BaseFormElement from "./BaseFormElement";
import type { UserFormData } from "../../types";

const UserForm: React.FC<{
  onSubmit: (data: UserFormData) => void;
  loading?: boolean;
}> = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState<UserFormData>({
    firstName: "",
    lastName: "",
    pid: "",
    phoneNumber: "",
    email: "",
    password: "",
    address: "",
    profileImage: null,
  });

  const [error, setError] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
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

    let imageUrl = null;

    if (formData.profileImage && formData.profileImage instanceof File) {
      setUploading(true);

      const data = new FormData();
      data.append("file", formData.profileImage);
      data.append("upload_preset", "rf6cxjxc");
      data.append("cloud_name", "dpndhq1l9");

      try {
        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dpndhq1l9/image/upload",
          {
            method: "POST",
            body: data,
          }
        );

        const result = await res.json();

        if (!res.ok)
          throw new Error(result?.error?.message || "Image upload failed");

        imageUrl = result.secure_url;
        console.log("Image uploaded:", imageUrl);
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        setError("Image upload failed. Please try again.");
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    console.log("Submitting user registration:", {
      ...formData,
      profileImage: imageUrl || null,
      email: formData.email,
    });

    try {
      onSubmit({
        ...formData,
        profileImage: imageUrl || null,
      });
      console.log(" User form submitted successfully");
    } catch (error) {
      console.error("User form submission failed:", error);
    }
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
        type="text"
        label="Address"
        name="address"
        value={formData.address || ""}
        onChange={handleChange}
        required
      />

      <BaseFormElement
        type="file"
        label="Profile Image"
        name="profileImage"
        onChange={handleChange}
        helperText="Optional profile picture"
      />

      {uploading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Uploading image...
        </Alert>
      )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3 }}
        disabled={loading}
      >
        {loading ? "Registering..." : "Register as User"}
      </Button>
    </Box>
  );
};

export default UserForm;
