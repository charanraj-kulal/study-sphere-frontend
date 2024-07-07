// App.jsx
import React from "react";
import "./styles/App.css";
import ThemeProvider from "./theme";
import { UserProvider } from "./UserContext";
import RouterComponent from "./routes/sections"; // Import the modified Router
import { ToastProvider } from "./hooks/ToastContext";

const App = () => {
  return (
    <ToastProvider>
      <UserProvider>
        <ThemeProvider>
          <div className="App">
            <RouterComponent />
          </div>
        </ThemeProvider>
      </UserProvider>
    </ToastProvider>
  );
};

export default App;
