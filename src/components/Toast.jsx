import React, { useEffect } from "react";
import "../styles/Toast.css";

const Toast = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer1 = setTimeout(() => {
      onClose();
    }, 5000);

    const timer2 = setTimeout(() => {
      document.querySelector(".progress").classList.remove("active");
    }, 5300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onClose]);

  return (
    <div className={`toast active ${type}`}>
      <div className="toast-content">
        <i
          className={`fas ${
            type === "success" ? "fa-solid fa-check" : "fa-solid fa-times"
          } check`}
        ></i>
        <div className="message">
          <span className="text text-1">
            {type === "success" ? "Success" : "Error"}
          </span>
          <span className="text text-2">{message}</span>
        </div>
      </div>
      <i className="fa fa-times close" onClick={onClose}></i>
      <div className={`progress active ${type}`}></div>
    </div>
  );
};

export default Toast;
