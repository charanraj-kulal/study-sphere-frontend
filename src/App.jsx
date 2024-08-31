// src/App.jsx
import React from "react";
import "./styles/App.css";
import "./styles/Font.css";
import ThemeProvider from "./theme";
import { LanguageProvider } from "./hooks/LanguageContext";
import { UserProvider } from "./hooks/UserContext";
import RouterComponent from "./routes/sections";
import { ToastProvider } from "./hooks/ToastContext";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n"; // Import i18n configuration

const App = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <LanguageProvider>
        <ToastProvider>
          <UserProvider>
            <ThemeProvider>
              <div className="App">
                <RouterComponent />
              </div>
            </ThemeProvider>
          </UserProvider>
        </ToastProvider>
      </LanguageProvider>
    </I18nextProvider>
  );
};

export default App;
