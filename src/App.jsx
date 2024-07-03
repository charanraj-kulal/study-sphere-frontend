// App.jsx
import React from "react";
import "./styles/App.css";
import ThemeProvider from "./theme";
import { UserProvider } from "./UserContext";
import RouterComponent from "./routes/sections"; // Import the modified Router

const App = () => {
  return (
    <UserProvider>
      <ThemeProvider>
        <div className="App">
          <RouterComponent />
        </div>
      </ThemeProvider>
    </UserProvider>
  );
};

export default App;
