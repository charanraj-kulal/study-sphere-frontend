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

const colleges = [
  "Acharya Institute of Graduate Studies, Bangalore",
  "Akshaya College, Puttur",
  "Alvas College, Moodbidre",
  "Besant Women's College, Mangalore",
  "BMS Institute of Technology and Management, Bangalore",
  "Canara College, Mangalore",
  "Carmel Degree College, Modankap, Bantwal",
  "Cauvery College, Gonikoppal",
  "East West Institute of Technology, Bangalore",
  "Field Marshal KM Cariappa College, Madikeri(FMC Madikeri)",
  "Government First Grade College for Women, Mangalore",
  "Government First Grade College, Bettampady",
  "Government First Grade College, Madikeri",
  "Government First Grade College, Mangalore",
  "Government First Grade College, Sullia",
  "Government First Grade College, Uppinangady",
  "Government First Grade College, Virajpet",
  "Govinda Dasa College - [GDC],Surathkal",
  "Kristu Jayanti College, Autonomous, Bangalore",
  "Mangalore Institute of Technology & Engineering (MITE), Moodbidre",
  "Mangalore University",
  "Maps College, Mangalore",
  "Meredian College, Mangalore",
  "Milagres College, Mangalore",
  "MGM Degree college, Kushalnagar",
  "Nehru Memorial College, Sullia",
  "NMAM Institute of Technology, Karkala",
  "Nirmala College of Information Technology",
  "P. A. First Grade College, Mangalore",
  "Padua Degree College, Mangalore",
  "PES University, Bangalore",
  "Sacred Heart College, Madanthyar",
  "SCS First Grade College, Mangalore",
  "SDM College of Business Management, Mangalore",
  "Sharada College. Devinagara, Talapady, Mangalore",
  "Shree Devi College, Mangalore",
  "Shree Devi Institute of Technology, Mangalore",
  "Sri Bhuvanendra College, Karkala",
  "Sri Dharmasthala Manjunatheshwara College, Ujire",
  "Sri Dhavala College, Moodbidre",
  "Sri Mahaveera College, Moodabidri",
  "Sri Rama First Grade College, Kalladka",
  "Sri Ramakrishna College, Mangalore",
  "Sri Venkataramana Swamy College, Bantwal",
  "Srinivas College Pandeshwar",
  "Srinivas College, Pandeshwar",
  "Srinivas Institute of Technology (SIT)",
  "St Aloysius College (Autonomous), Mangaluru",
  "St Aloysius Institute of Management & Information Technology (AIMIT), Mangalore",
  "St Joseph Engineering College, Mangalore",
  "St Philomena College, Puttur",
  "St. Agnes College (Autonomous), Mangaluru",
  "St. Anne's Degree College, Virajpet",
  "St. Raymond's College, Vamajoor",
  "University College, Mangalore",
  "Vidyarashmi Vidyalaya, Savanoor",
  "Vijaya College, Mulki",
  "Vivekananda Degree College, Puttur",
  "Yenepoya Institute of Arts, Science, Commerce and Management",
  "Yenepoya Institute of Arts, Science, Commerce and Management, Mangalore",
  "Yenepoya(Deemed-to-be-University), Bangalore",
];
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

const EditStudentDialog = ({ open, onClose, user, setUsers }) => {
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
        collegeName: editedUser.collegeName,
        status: editedUser.status,
      });

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === editedUser.id
            ? {
                ...u,
                name: editedUser.name,
                course: editedUser.course,
                collegeName: editedUser.collegeName,
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
          <InputLabel>College Name</InputLabel>
          <Select
            name="collegeName"
            value={editedUser.collegeName}
            onChange={handleInputChange}
          >
            {colleges.map((collegeName) => (
              <MenuItem key={collegeName} value={collegeName}>
                {collegeName}
              </MenuItem>
            ))}
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

EditStudentDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  setUsers: PropTypes.func.isRequired,
};

export default EditStudentDialog;
