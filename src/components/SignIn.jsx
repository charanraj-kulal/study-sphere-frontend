import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import Toast from "./Toast"; // Assuming you have Toast component
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function SignInForm() {
  const [state, setState] = useState({
    email: "",
    password: "",
  });
  const [toast, setToast] = useState({
    visible: false,
    type: "",
    message: "",
  });
  const navigate = useNavigate();

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setState({
      ...state,
      [name]: value,
    });
  };

  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailPattern.test(email);
  };

  const handleOnSubmit = async (evt) => {
    evt.preventDefault();
    const { email, password } = state;

    // Validate inputs
    if (!email) {
      setToast({
        visible: true,
        type: "error",
        message: "Email is required.",
      });
      return;
    }

    if (!validateEmail(email)) {
      setToast({
        visible: true,
        type: "error",
        message: "Invalid email format.",
      });
      return;
    }

    if (!password) {
      setToast({
        visible: true,
        type: "error",
        message: "Password is required.",
      });
      return;
    }

    if (password.length < 6) {
      setToast({
        visible: true,
        type: "error",
        message: "Password must be at least 6 characters long.",
      });
      return;
    }

    const auth = getAuth();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Fetch additional user details from Firestore
      const token = await user.getIdToken();
      const decodedToken = parseJwt(token);

      // Store the token and user info in sessionStorage
      sessionStorage.setItem("jwtToken", token);
      sessionStorage.setItem("userName", decodedToken.name);
      sessionStorage.setItem("userRole", decodedToken.role);
      sessionStorage.setItem("userCourse", decodedToken.course);
      sessionStorage.setItem("userEmail", decodedToken.email);

      setToast({
        visible: true,
        type: "success",
        message: "You are logged in successfully.",
      });

      // Clear form inputs
      setState({
        email: "",
        password: "",
      });

      // Navigate after toast is displayed
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000); // Adjust delay as needed for the toast message duration
    } catch (error) {
      console.error("Error during authentication:", error);
      setToast({
        visible: true,
        type: "error",
        message: "Error signing in. Please check your credentials.",
      });
    }
  };

  // Function to decode JWT token
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="form-container sign-in-container">
      {toast.visible && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, visible: false })}
        />
      )}
      <form onSubmit={handleOnSubmit}>
        <h1>Sign in</h1>
        <div className="social-container">
          <a href="#" className="social">
            <i className="fab fa-facebook-f" />
          </a>
          <a href="#" className="social">
            <i className="fab fa-google-plus-g" />
          </a>
          <a href="#" className="social">
            <i className="fab fa-linkedin-in" />
          </a>
        </div>
        <span>or use your account</span>
        <input
          type="email"
          placeholder="Email"
          name="email"
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
