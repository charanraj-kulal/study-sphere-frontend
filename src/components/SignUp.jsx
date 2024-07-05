import React, { useState } from "react";
import { collection, doc, setDoc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../firebase";
import Toast from "./Toast";
import LottieLoader from "./LottieLoader";

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

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        course,
        userId: user.uid,
        userrole,
        profilePhotoURL,
        status,
      });

      await sendEmailVerification(user);

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

  const courses = ["MTech", "MBA", "MCA"];

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
          <input
            type="file"
            name="profilePhoto"
            onChange={handleChange}
            accept="image/*"
          />
          <button type="submit">Sign Up</button>
        </form>
      </div>
    </div>
  );
}

export default SignUpForm;
