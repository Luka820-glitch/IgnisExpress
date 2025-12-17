import React from "react";
import {
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from "@mui/material";

export interface BaseFormElementProps {
  type?:
    | "text"
    | "email"
    | "password"
    | "select"
    | "file"
    | "time"
    | "day"
    | "number";
  label: string;
  name: string;
  value?: any;
  onChange: (e: any) => void;
  error?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  disabled?: boolean;
  helperText?: string;
  placeholder?: string;
}

const BaseFormElement: React.FC<BaseFormElementProps> = ({
  type = "text",
  label,
  name,
  value = "",
  onChange,
  error,
  required = false,
  options = [],
  disabled = false,
  helperText,
  placeholder,
}) => {
  const renderInput = () => {
    switch (type) {
      case "select":
        return (
          <FormControl fullWidth error={!!error} disabled={disabled}>
            <InputLabel>
              {label}
              {required ? " *" : ""}
            </InputLabel>
            <Select
              name={name}
              value={value}
              onChange={onChange}
              label={`${label}${required ? " *" : ""}`}
            >
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {(error || helperText) && (
              <FormHelperText>{error || helperText}</FormHelperText>
            )}
          </FormControl>
        );

      case "file":
        return (
          <TextField
            fullWidth
            type="file"
            label={label}
            name={name}
            onChange={onChange}
            error={!!error}
            helperText={error || helperText}
            required={required}
            disabled={disabled}
            margin="normal"
            slotProps={{
              inputLabel: {
                shrink: true,
              },
              htmlInput: {
                accept: "image/*",
              },
            }}
          />
        );

      default:
        return (
          <TextField
            fullWidth
            type={type}
            label={`${label}${required ? " *" : ""}`}
            name={name}
            value={value}
            onChange={onChange}
            error={!!error}
            helperText={error || helperText}
            required={required}
            disabled={disabled}
            margin="normal"
            placeholder={placeholder}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
              htmlInput: {
                placeholder: placeholder,
              },
            }}
          />
        );
    }
  };

  return renderInput();
};

export default BaseFormElement;
