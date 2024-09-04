import React, { useState } from "react";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useTranslation } from "react-i18next";

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export default function AddressForm({ onSubmit, initialData }) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: initialData.name || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    address: "",
    pincode: "",
    state: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        fullWidth
        margin="normal"
        name="name"
        label={t("af_name")}
        value={formData.name}
        onChange={handleChange}
        required
      />
      <TextField
        fullWidth
        margin="normal"
        name="email"
        label={t("af_email")}
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <TextField
        fullWidth
        margin="normal"
        name="phone"
        label={t("af_phone")}
        value={formData.phone}
        onChange={handleChange}
        required
      />
      <TextField
        fullWidth
        margin="normal"
        name="address"
        label={t("af_address")}
        multiline
        rows={3}
        value={formData.address}
        onChange={handleChange}
        required
      />
      <TextField
        fullWidth
        margin="normal"
        name="pincode"
        label={t("af_pincode")}
        value={formData.pincode}
        onChange={handleChange}
        required
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>{t("af_state")}</InputLabel>
        <Select
          name="state"
          value={formData.state}
          onChange={handleChange}
          required
        >
          {indianStates.map((state) => (
            <MenuItem key={state} value={state}>
              {state}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button type="submit" variant="contained" color="primary" fullWidth>
        {t("af_save_address")}
      </Button>
    </form>
  );
}
