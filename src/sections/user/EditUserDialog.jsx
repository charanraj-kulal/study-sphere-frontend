// EditUserDialog.js
import React, { useState, useEffect } from "react";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase"; // Adjust this import path as needed
import PropTypes from "prop-types";
import { useToast } from "../../hooks/ToastContext";
import LottieLoader from "../../components/LottieLoader";

const courses = [
  "Associate Degree",
  "Bachelor of Arts (BA)",
  "Bachelor of Business Administration (BBA)",
  "Bachelor of Commerce (BCom)",
  "Bachelor of Computer Applications (BCA)",
  "Bachelor of Education (BEd)",
  "Bachelor of Engineering (BE)",
  "Bachelor of Fine Arts (BFA)",
  "Bachelor of Laws (LLB)",
  "Bachelor of Medicine, Bachelor of Surgery (MBBS)",
  "Bachelor of Nursing (BN)",
  "Bachelor of Pharmacy (BPharm)",
  "Bachelor of Science (BSc)",
  "Bachelor of Technology (BTech)",
  "Diploma",
  "Doctor of Business Administration (DBA)",
  "Doctor of Education (EdD)",
  "Doctor of Medicine (MD)",
  "Doctor of Philosophy (PhD)",
  "Executive Master of Business Administration (EMBA)",
  "Juris Doctor (JD)",
  "Master of Arts (MA)",
  "Master of Business Administration (MBA)",
  "Master of Commerce (MCom)",
  "Master of Computer Applications (MCA)",
  "Master of Education (MEd)",
  "Master of Engineering (ME)",
  "Master of Fine Arts (MFA)",
  "Master of Laws (LLM)",
  "Master of Pharmacy (MPharm)",
  "Master of Public Administration (MPA)",
  "Master of Public Health (MPH)",
  "Master of Science (MSc)",
  "Master of Social Work (MSW)",
  "Master of Technology (MTech)",
  "Postgraduate Certificate",
  "Postgraduate Diploma",
];

const EditUserDialog = ({ open, onClose, user, setUsers }) => {
  const [editedUser, setEditedUser] = useState(user);
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setEditedUser(user);
  }, [user]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditedUser({ ...editedUser, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      const userRef = doc(db, "users", editedUser.id);
      await updateDoc(userRef, {
        name: editedUser.name,
        course: editedUser.course,
        userrole:
          editedUser.role === "Admin"
            ? 1
            : editedUser.role === "Lecturer"
              ? 2
              : 3,
        status: editedUser.status,
      });

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === editedUser.id
            ? {
                ...u,
                name: editedUser.name,
                course: editedUser.course,
                userrole:
                  editedUser.role === "Admin"
                    ? 1
                    : editedUser.role === "Lecturer"
                      ? 2
                      : 3,
                status: editedUser.status,
              }
            : u
        )
      );

      onClose();
      showToast("success", "User updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      showToast("error", "Erro while updating user deatils");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          name="name"
          label="Name"
          type="text"
          fullWidth
          value={editedUser.name}
          onChange={handleInputChange}
        />
        <TextField
          margin="dense"
          name="email"
          label="Email"
          type="email"
          fullWidth
          value={editedUser.email}
          disabled
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Course</InputLabel>
          <Select
            name="course"
            value={editedUser.course}
            onChange={handleInputChange}
          >
            {courses.map((course) => (
              <MenuItem key={course} value={course}>
                {course}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="dense">
          <InputLabel>Role</InputLabel>
          <Select
            name="role"
            value={editedUser.role}
            onChange={handleInputChange}
          >
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Lecturer">Lecturer</MenuItem>
            <MenuItem value="Student">Student</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="dense">
          <InputLabel>Status</InputLabel>
          <Select
            name="status"
            value={editedUser.status}
            onChange={handleInputChange}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="banned">Banned</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Update</Button>
      </DialogActions>
    </Dialog>
  );
};

EditUserDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  setUsers: PropTypes.func.isRequired,
};

export default EditUserDialog;
