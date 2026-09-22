import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Sidebar from "./components/Sidebar";

import Preferences from "./pages/Notifications/SettingsNotifications/Preferences";
import Events from "./pages/Notifications/SettingsNotifications/Events";
import EventMapping from "./pages/Notifications/SettingsNotifications/EventMapping";
import Templates from "./pages/Notifications/SettingsNotifications/Templates";

function App() {
  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/settings" replace />}
          />

          <Route
            path="/settings"
            element={
              <Navigate
                to="/settings/notifications/preferences"
                replace
              />
            }
          />

          <Route
            path="/settings/notifications/preferences"
            element={<Preferences />}
          />

          <Route
            path="/settings/notifications/events"
            element={<Events />}
          />

          <Route
            path="/settings/notifications/event-mapping"
            element={<EventMapping />}
          />

          <Route
            path="/settings/notifications/templates"
            element={<Templates />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;