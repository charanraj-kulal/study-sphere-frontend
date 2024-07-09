import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useUser } from "../hooks/UserContext";
import Toast from "./ToastLogin";
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

    if (!email) {
      setToast({ visible: true, type: "error", message: "Email is required" });
      return;
    }

    if (!validateEmail(email)) {
      setToast({
        visible: true,
        type: "error",
        message: "Invalid email format",
      });
      return;
    }

    if (!password) {
      setToast({
        visible: true,
        type: "error",
        message: "Password is required",
      });
      return;
    }

    if (password.length < 6) {
      setToast({
        visible: true,
        type: "error",
        message: "Password must be at least 6 characters",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.isEmailVerified) {
          updateUserData({
            displayName: data.displayName,
            uid: data.uid,
            course: data.course,

            email: data.email,
            photoURL: data.photoURL,
            userRole: data.userRole,
            status: data.status,
            isVerified: "Yes",
            isEmailVerified: data.isEmailVerified,
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
            message: "Please verify your email before logging in",
          });
        }
      } else {
        setToast({
          visible: true,
          type: "error",
          message: data.message || "Invalid credentials",
        });
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      setToast({ visible: true, type: "error", message: "Error signing in" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container sign-in-container">
      {isLoading && <LottieLoader />}

      {toast.visible && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, visible: false })}
        />
      )}
      <form style={{ width: 384 }} onSubmit={handleOnSubmit}>
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
