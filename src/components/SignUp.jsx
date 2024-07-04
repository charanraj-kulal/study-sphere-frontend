import React, { useState } from "react";
import { collection, doc, setDoc } from "firebase/firestore"; // Adjusted import for setDoc
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { auth, db } from "../firebase"; // Adjust the path as needed
import Toast from "./Toast"; // Import the Toast component

function SignUpForm() {
  const [state, setState] = useState({
    name: "",
    email: "",
    password: "",
    course: "",
  });

  const [toast, setToast] = useState({
    visible: false,
    type: "",
    message: "",
  });

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setState({
      ...state,
      [name]: value,
    });
  };

  const handleOnSubmit = async (evt) => {
    evt.preventDefault();

    const { name, email, password, course } = state;
    const userrole = 3;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Use setDoc with the user ID as the document ID
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        course,
        userId: user.uid,
        userrole, // Save user role in database
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
    }
  };

  const courses = ["MTech", "MBA", "MCA"];

  return (
    <div className="form-container sign-up-container">
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
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default SignUpForm;
