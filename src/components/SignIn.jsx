// src/components/SignInForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useUser } from "../UserContext";
import Toast from "./Toast";
import LottieLoader from "./LottieLoader";

function SignInForm() {
  const [state, setState] = useState({ email: "", password: "" });
  const [toast, setToast] = useState({ visible: false, type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { updateUserData } = useUser();
  const navigate = useNavigate();

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setState({ ...state, [name]: value });
  };

  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailPattern.test(email);
  };

  const handleOnSubmit = async (evt) => {
    evt.preventDefault();
    const { email, password } = state;

    if (!email || !validateEmail(email) || !password || password.length < 6) {
      setToast({ visible: true, type: "error", message: "Invalid input" });
      return;
    }

    setIsLoading(true); // Start loading

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Received data:", data);

        updateUserData({
          displayName: data.displayName,
          email: data.email,
          photoURL: data.photoURL,
          userRole: data.userRole,
        });

        setToast({
          visible: true,
          type: "success",
          message: "Login successful",
        });

        setTimeout(() => {
          navigate("/dashboard");
        }, 3000);
      } else {
        setToast({
          visible: true,
          type: "error",
          message: "Invalid credentials",
        });
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      setToast({ visible: true, type: "error", message: "Error signing in" });
    } finally {
      setIsLoading(false); // Stop loading regardless of outcome
    }
  };

  return (
    <div className="form-container sign-in-container">
      {isLoading && <LottieLoader />} {/* Render loader before the form */}
      {toast.visible && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, visible: false })}
        />
      )}
      <form onSubmit={handleOnSubmit}>
        <h1>Sign in</h1>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={state.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={state.password}
          onChange={handleChange}
        />
        <Link to="/">Forgot your password?</Link>
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}

export default SignInForm;
