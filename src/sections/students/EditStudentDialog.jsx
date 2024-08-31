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

const universities = [
  "University of Mysore",
  "Karnataka University",
  "Bangalore University",
  "Mangalore University",
  "Gulbarga University",
  "Kuvempu University",
  "Kannada University",
  "Karnataka State Open University",
  "Visweswaraiah Technological University",
  "Karnataka State Akkamahadevi Women's University",
  "Tumkur University",
  "Davangere University",
  "Karnataka State Gangubai Hanagal Music University",
  "Rani Channamma University",
  "Vijayanagara Sri Krishnadevaraya University",
  "Karnataka Sanskrit University",
  "Karnataka Janapadha University",
  "Bengaluru City University",
  "Bengaluru North University",
  "Maharani Cluster University",
  "Mandya Unitary University",
  "Nrupathunga University",
  "Raichur University",
  "University of Visvesvaraya College of Engineering",
  "Bengaluru Dr. B R Ambedkar School of Economics University",
  "Koppala University",
  "Chamarajanagara University",
  "Bagalkote University",
  "Bidar University",
  "Haveri University",
  "Hassan University",
  "Kodagu University",
  "Karnataka State Rural Development and Panchayat Raj University",
  "University of Agricultural Sciences (Bangalore)",
  "University of Agricultural Sciences (Dharwad)",
  "University of Agricultural Sciences (Raichuru)",
  "Keladi Shivappa Nayaka University of Agricultural and Horticultural Sciences",
  "University of Horticultural Sciences",
  "Karnataka Veterinary, Animal & Fisheries Sciences University",
  "Karnataka State Law University",
  "Rajiv Gandhi University of Health Sciences",
  "Alliance University",
  "Azim Premji University",
  "Presidency University",
  "CMR University",
  "PES University",
  "MS Ramaiah University of Applied Sciences",
  "Reva University",
  "Dayananda Sagar University",
  "Rai Technology University",
  "JSS Science and Technology University",
  "KLE University",
  "Srinivasa University",
  "Sharanbasva University",
  "The University of Trans-Disciplinary Health Sciences & Technology",
  "Adichunchanagiri University",
  "Garden City University",
  "Khaja Bandanawz University",
  "Sri Satya Sai University for Human Excellence",
  "Sri Dharmasthala Manjunatheswara University",
  "Vidyashilp University",
  "Atria University",
  "Chanakya University",
  "Sri Jagadhguru Murugharajendra University",
  "RV University",
  "Kishkinda University",
  "Amity University",
  "G M University",
  "St. Joseph's University",
  "Manipal Academy of Higher Education",
  "Swami Vivekananda Yoga Anusandhana Samsthana",
  "Sri Devaraj Urs Academy of Higher Education & Research",
  "Yenepoya University",
  "BLDE University",
  "JSS Academy of Higher Education and Research",
  "Sri Siddartha Academy of Higher Education",
  "Christ University",
  "Jain University",
  "NITTE University",
  "KLE Academy of Higher Education & Research",
  "Central University of Karnataka",
  "Indian Institute of Science",
  "International Institute of Information Technology",
  "Jawaharlal Nehru Centre for Advanced Scientific Research",
  "National Institute of Mental Health and Neuro Sciences",
  "National Institute Technology",
  "Indian Institute of Management",
  "National Law School of India University",
  "Indian Institute of Information Technology (Dharawad)",
  "Indian Institute of Technology",
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
        university: editedUser.university,
        status: editedUser.status,
      });

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === editedUser.id
            ? {
                ...u,
                name: editedUser.name,
                course: editedUser.course,
                university: editedUser.university,
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
          <InputLabel>Univerist Name</InputLabel>
          <Select
            name="university"
            value={editedUser.university}
            onChange={handleInputChange}
          >
            {universities.map((university) => (
              <MenuItem key={university} value={university}>
                {university}
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
