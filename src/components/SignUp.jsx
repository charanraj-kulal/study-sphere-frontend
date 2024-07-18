import React, { useState } from "react";
import { collection, doc, setDoc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { auth, db, storage } from "../firebase";
import Toast from "./ToastLogin";
import LottieLoader from "./LottieLoader";

import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { styled } from "@mui/material/styles";

import Iconify from "./iconify";

function SignUpForm() {
  const [state, setState] = useState({
    name: "",
    email: "",
    collegeName: "",
    password: "",
    course: "",
    profilePhoto: null,
  });
  const CenteredSelect = styled(Select)({
    "& .MuiSelect-select": {
      paddingRight: "24px", // Adjust padding for the dropdown icon
    },
    "& .MuiMenu-paper": {
      maxHeight: "300px", // Adjust the maximum height of the dropdown
    },
  });
  const [toast, setToast] = useState({
    visible: false,
    type: "",
    message: "",
  });

  const [isLoading, setIsLoading] = useState(false);
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

  const handleChange = (evt) => {
    const { name, value, files } = evt.target;
    if (name === "profilePhoto") {
      setState({
        ...state,
        profilePhoto: files[0],
      });
    } else {
      setState({
        ...state,
        [name]: value,
      });
    }
  };

  const handleOnSubmit = async (evt) => {
    evt.preventDefault();

    const { name, email, collegeName, password, course, profilePhoto } = state;
    const userrole = 3;
    const status = "active";
    const isVerified = "No";
    const points = 0;
    const uploadCount = 0;
    const downloadCount = 0;

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      let profilePhotoURL = "";
      if (profilePhoto) {
        const storageRef = ref(storage, `profilePhotos/${user.uid}`);
        await uploadBytes(storageRef, profilePhoto);
        profilePhotoURL = await getDownloadURL(storageRef);
      }

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        collegeName,
        course,
        userId: user.uid,
        userrole,
        profilePhotoURL,
        status,
        isVerified,
        uploadCount,
        downloadCount,
        points,
        countOfRejection: 0,
        countOfApprove: 0,
      });

      await sendEmailVerification(user);

      // Listen for email verification status change
      onAuthStateChanged(auth, async (user) => {
        if (user && user.emailVerified) {
          // Update isVerified to Yes after email is verified
          await setDoc(
            doc(db, "users", user.uid),
            { isVerified: "Yes" },
            { merge: true }
          );
        }
      });

      setToast({
        visible: true,
        type: "success",
        message:
          "Sign up successful! Please check your email for verification.",
      });

      setState({
        name: "",
        email: "",
        collegeName: "",
        password: "",
        course: "",

        profilePhoto: null,
      });
    } catch (error) {
      let errorMessage = "Error signing up. Please try again later.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage =
          "Email address is already in use. Please use a different email.";
      }

      setToast({
        visible: true,
        type: "error",
        message: errorMessage,
      });
    } finally {
      await signOut(auth);
      setIsLoading(false); // Stop loading regardless of outcome
    }
  };

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

  return (
    <div className="form-container sign-up-container">
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {isLoading && <LottieLoader />} {/* Render loader before the form */}
        {toast.visible && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast({ ...toast, visible: false })}
          />
        )}
        <form onSubmit={handleOnSubmit}>
          <h1>Create Account</h1>
          <span>or use your email for registration</span>
          <input
            type="text"
            name="name"
            value={state.name}
            onChange={handleChange}
            placeholder="Name"
          />
          <input
            type="email"
            name="email"
            value={state.email}
            onChange={handleChange}
            placeholder="Email"
          />
          <select
            name="collegeName"
            value={state.collegeName}
            onChange={handleChange}
          >
            <option value="">Select Your College</option>
            {colleges.map((collegeName, index) => (
              <option key={index} value={collegeName}>
                {collegeName}
              </option>
            ))}
          </select>
          {/* <FormControl fullWidth>
            <InputLabel id="college-select-label">
              Select Your College
            </InputLabel>
            <CenteredSelect
              labelId="college-select-label"
              name="collegeName"
              value={state.collegeName}
              onChange={handleChange}
              label="Select Your College"
              MenuProps={{
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "center",
                },
                transformOrigin: {
                  vertical: "top",
                  horizontal: "center",
                },
                getContentAnchorEl: null,
                PaperProps: {
                  style: {
                    maxHeight: "300px", // Adjust the maximum height of the dropdown
                  },
                },
              }}
            >
              <MenuItem value="">
                <em>Select Your College</em>
              </MenuItem>
              {colleges.map((collegeName, index) => (
                <MenuItem key={index} value={collegeName}>
                  {collegeName}
                </MenuItem>
              ))}
            </CenteredSelect>
          </FormControl> */}
          <input
            type="password"
            name="password"
            value={state.password}
            onChange={handleChange}
            placeholder="Password"
          />
          <select name="course" value={state.course} onChange={handleChange}>
            <option value="">Select Course</option>
            {courses.map((course, index) => (
              <option key={index} value={course}>
                {course}
              </option>
            ))}
          </select>
          <label htmlFor="profile-photo-upload" style={{ cursor: "pointer" }}>
            <IconButton
              component="span"
              sx={{
                display: "block",
                margin: "auto",
                textAlign: "center",
                "&:hover": { color: "blue" },
              }}
            >
              <Iconify icon="mingcute:upload-3-fill" />
              <Typography variant="body2">Upload Profile Photo</Typography>
            </IconButton>
          </label>
          <input
            id="profile-photo-upload"
            type="file"
            name="profilePhoto"
            onChange={handleChange}
            accept="image/*"
            style={{ display: "none" }} // Hide the input element visually
          />
          <button type="submit">Sign Up</button>
        </form>
      </div>
    </div>
  );
}

export default SignUpForm;
