import React, { useState } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import {
  Box,
  Button,
  Alert,
  Grid,
  Paper,
  Typography,
  IconButton,
  Stack,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import type { CourierFormData, WeekDay } from "../../types";
import BaseFormElement from "../forms/BaseFormElement";

interface CourierFormProps {
  onSubmit: (data: CourierFormData) => void;
  loading?: boolean;
}

const vehicleOptions = [
  { value: "bicycle", label: "Bicycle" },
  { value: "motorcycle", label: "Motorcycle" },
  { value: "car", label: "Car" },
  { value: "van", label: "Van" },
  { value: "truck", label: "Truck" },
];

const weekDays: { value: WeekDay; label: string }[] = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      options.push({ value: timeString, label: timeString });
    }
  }
  return options;
};

const timeOptions = generateTimeOptions();

const baseFields = [
  {
    name: "firstName",
    label: "First Name",
    type: "text" as const,
    required: true,
  },
  {
    name: "lastName",
    label: "Last Name",
    type: "text" as const,
    required: false,
  },
  {
    name: "pid",
    label: "Personal ID (PID)",
    type: "text" as const,
    required: true,
    helperText: "11-digit personal ID",
  },
  {
    name: "phoneNumber",
    label: "Phone Number",
    type: "text" as const,
    required: true,
  },
  { name: "email", label: "Email", type: "email" as const, required: true },
  {
    name: "password",
    label: "Password",
    type: "password" as const,
    required: true,
    helperText: "Minimum 6 characters",
  },
  {
    name: "vehicle",
    label: "Vehicle Type",
    type: "select" as const,
    required: true,
    options: vehicleOptions,
  },
];

const CourierForm: React.FC<CourierFormProps> = ({
  onSubmit,
  loading = false,
}) => {
  const methods = useForm<CourierFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      pid: "",
      phoneNumber: "",
      email: "",
      password: "",
      vehicle: "",
      workingDays: [],
      profileImage: null,
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    control,
    setError,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "workingDays",
  });

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const addWorkingDay = () =>
    append({
      day: "monday",
      startHours: "09:00",
      endHours: "17:00",
      isActive: true,
    });

  const validateWorkingDay = (index: number) => {
    const day = watch(`workingDays.${index}`);
    if (day?.startHours && day?.endHours && day.startHours >= day.endHours) {
      return "End time must be after start time";
    }
    return true;
  };

  const handleFormSubmit = async (data: CourierFormData) => {
    if (!data.workingDays || data.workingDays.length < 5) {
      setError("workingDays", {
        type: "manual",
        message: "Minimum 5 working days required",
      });
      return;
    }

    const duplicateDays = data.workingDays.map((d) => d.day);
    if (new Set(duplicateDays).size !== duplicateDays.length) {
      setError("workingDays", {
        type: "manual",
        message: "Duplicate days are not allowed",
      });
      return;
    }

    const invalidTimes = data.workingDays.filter(
      (d) => d.startHours >= d.endHours
    );
    if (invalidTimes.length > 0) {
      setError("workingDays", {
        type: "manual",
        message: "End time must be after start time",
      });
      return;
    }

    let imageUrl: string | null = null;
    if (data.profileImage instanceof File) {
      setUploading(true);
      setUploadError(null);
      const formData = new FormData();
      formData.append("file", data.profileImage);
      formData.append("upload_preset", "rf6cxjxc");
      formData.append("cloud_name", "dpndhq1l9");

      try {
        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dpndhq1l9/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );
        const result = await res.json();
        if (!res.ok) throw new Error(result?.error?.message || "Upload failed");
        imageUrl = result.secure_url;
      } catch (err) {
        console.error(err);
        setUploadError("Image upload failed. Please try again.");
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    onSubmit({ ...data, profileImage: imageUrl || null });
  };

  return (
    <FormProvider {...methods}>
      <Box
        component="form"
        onSubmit={handleSubmit(handleFormSubmit)}
        sx={{ mt: 2 }}
      >
        <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
          Personal Information
        </Typography>
        <Stack spacing={2}>
          {baseFields.map((field) => (
            <BaseFormElement
              key={field.name}
              type={field.type}
              label={field.label}
              name={field.name as any}
              value={watch(field.name as keyof CourierFormData) || ""}
              onChange={(e) => {
                setValue(
                  field.name as keyof CourierFormData,
                  e.target.value as any
                );
                if (field.required)
                  trigger(field.name as keyof CourierFormData);
              }}
              error={(errors as any)[field.name]?.message as string}
              required={field.required}
              options={field.options}
              helperText={field.helperText}
            />
          ))}
        </Stack>

        <Box sx={{ mt: 3 }}>
          <BaseFormElement
            type="file"
            label="Profile Image"
            name="profileImage"
            value=""
            onChange={(e) => {
              const files = (e.target as HTMLInputElement).files;
              if (files && files[0]) setValue("profileImage", files[0]);
            }}
            helperText="Optional profile picture"
          />
          {uploading && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Uploading image...
            </Alert>
          )}
          {uploadError && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {uploadError}
            </Alert>
          )}
        </Box>

        <Box mt={4}>
          <Typography
            variant="h5"
            gutterBottom
            color="primary"
            fontWeight="bold"
          >
            Working Schedule
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add at least 5 working days
          </Typography>

          {fields.map((field, index) => (
            <Paper
              key={field.id}
              sx={{ p: 3, mb: 2, bgcolor: "background.default" }}
            >
              <Grid container spacing={2} alignItems="start">
                <Grid size={{ xs: 12, md: 3 }}>
                  <BaseFormElement
                    type="select"
                    label="Day"
                    name={`workingDays.${index}.day`}
                    value={watch(`workingDays.${index}.day`) || ""}
                    onChange={(e) => {
                      setValue(
                        `workingDays.${index}.day` as any,
                        e.target.value
                      );
                      validateWorkingDay(index);
                    }}
                    required
                    options={weekDays}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <BaseFormElement
                    type="select"
                    label="Start Time"
                    name={`workingDays.${index}.startHours`}
                    value={watch(`workingDays.${index}.startHours`) || ""}
                    onChange={(e) => {
                      setValue(
                        `workingDays.${index}.startHours` as any,
                        e.target.value
                      );
                      validateWorkingDay(index);
                    }}
                    required
                    options={timeOptions}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <BaseFormElement
                    type="select"
                    label="End Time"
                    name={`workingDays.${index}.endHours`}
                    value={watch(`workingDays.${index}.endHours`) || ""}
                    onChange={(e) => {
                      setValue(
                        `workingDays.${index}.endHours` as any,
                        e.target.value
                      );
                      validateWorkingDay(index);
                    }}
                    required
                    options={timeOptions}
                  />
                </Grid>
                <Grid
                  size={{ xs: 12, md: 3 }}
                  sx={{ display: "flex", alignItems: "center", height: "100%" }}
                >
                  <IconButton
                    onClick={() => remove(index)}
                    color="error"
                    disabled={fields.length <= 5}
                    sx={{ mt: 2 }}
                    title="Remove working day"
                  >
                    <Delete />
                  </IconButton>
                </Grid>
              </Grid>
              {validateWorkingDay(index) !== true && (
                <Typography color="error" sx={{ mt: 1 }}>
                  {validateWorkingDay(index)}
                </Typography>
              )}
            </Paper>
          ))}

          <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
            <Button
              startIcon={<Add />}
              onClick={addWorkingDay}
              variant="outlined"
              disabled={fields.length >= 7}
            >
              Add Working Day
            </Button>
            <Typography variant="body2" color="text.secondary">
              ({fields.length}/7 days added)
            </Typography>
          </Box>

          {errors.workingDays && (
            <Alert severity="error">{errors.workingDays.message}</Alert>
          )}
        </Box>

        <Box mt={4}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || uploading}
          >
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </Box>
      </Box>
    </FormProvider>
  );
};

export default CourierForm;
