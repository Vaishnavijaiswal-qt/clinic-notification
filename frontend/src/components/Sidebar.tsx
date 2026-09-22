import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">Settings</div>

      <nav className="sidebar-nav">

        <div className="sidebar-section">
          <div className="sidebar-section-title">Notifications</div>

          <NavLink
            to="/settings/notifications/preferences"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            Preferences
          </NavLink>

          <NavLink
            to="/settings/notifications/events"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            Events
          </NavLink>

          <NavLink
            to="/settings/notifications/event-mapping"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            Event Mapping
          </NavLink>

          <NavLink
            to="/settings/notifications/templates"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            Templates
          </NavLink>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">
            Notification Management
          </div>

          <NavLink
            to="/notification-management"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            Notification Management
          </NavLink>
        </div>

      </nav>
    </aside>
  );
}

export default Sidebar;