import React, { useState } from "react";
import { collection, doc, setDoc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../firebase";
import Toast from "./ToastLogin";
import LottieLoader from "./LottieLoader";

import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

import Iconify from "./iconify";

function SignUpForm() {
  const [state, setState] = useState({
    name: "",
    email: "",
    password: "",
    course: "",
    profilePhoto: null,
  });

  const [toast, setToast] = useState({
    visible: false,
    type: "",
    message: "",
  });

  const [isLoading, setIsLoading] = useState(false);

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

    const { name, email, password, course, profilePhoto } = state;
    const userrole = 3;
    const status = "active";
    const isVerified = "No";
    const points = 0;
    const uploadCount = 0;
    const downloadCount = 0; // Initial value set to No

    setIsLoading(true); // Start loading

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

      // Add user document with isVerified set to No
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
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
      });

      await sendEmailVerification(user);

      // Listen for email verification status change
      onAuthStateChanged(auth, (user) => {
        if (user && user.emailVerified) {
          // Update isVerified to Yes after email is verified
          setDoc(
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
