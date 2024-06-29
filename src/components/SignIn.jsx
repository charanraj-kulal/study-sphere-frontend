import React, { useState } from "react";
import axios from "axios";
import Toast from "./Toast"; // Assuming you have Toast component

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

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setState({
      ...state,
      [name]: value,
    });
  };

  const handleOnSubmit = async (evt) => {
    evt.preventDefault();
    const { email, password } = state;

    try {
      const response = await axios.post("http://localhost:3000/login", {
        email,
        password,
      });
      const { token } = response.data;

      // Decode token to get user info
      const decodedToken = parseJwt(token); // Assuming parseJwt function is defined
      console.log(decodedToken);
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

      // Redirect or perform other actions on successful login
    } catch (error) {
      setToast({
        visible: true,
        type: "error",
        message:
          error.response?.data?.message ||
          "Error signing in. Please check your credentials.",
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
        <a href="#">Forgot your password?</a>
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}

export default SignInForm;
