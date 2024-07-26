import React, { useEffect } from "react";
import "../styles/Toast.css";

const Toast = ({ type, message, onClose, className }) => {
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

  const getIcon = () => {
    switch (type) {
      case "success":
        return "fa-solid fa-check";
      case "error":
        return "fa-solid fa-times";
      case "info":
        return "fa-solid fa-info";
      default:
        return "fa-solid fa-times";
    }
  };

  const getTitle = () => {
    switch (type) {
      case "success":
        return "Success";
      case "error":
        return "Error";
      case "info":
        return "Information";
      default:
        return "Notification";
    }
  };

  return (
    <div className={`toast active ${type} ${className}`}>
      <div className="toast-content">
        <div className="icon-container">
          <i className={`fas ${getIcon()} check`}></i>
        </div>
        <div className="message-container">
          <span className="text text-1">{getTitle()}</span>
          <span className="text text-2">{message}</span>
        </div>
      </div>
      <i className="fa fa-times close" onClick={onClose}></i>
      <div className={`progress active ${type}`}></div>
    </div>
  );
};

export default Toast;
