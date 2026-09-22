import { NavLink } from "react-router-dom";

function NotificationTabs() {
    return (
        <div className="notification-tabs">
            <NavLink
                to="/settings/notifications/preferences"
                className={({ isActive }) =>
                    `notification-tab ${isActive ? "active" : ""}`
                }
            >
                Preferences
            </NavLink>

            <NavLink
                to="/settings/notifications/events"
                className={({ isActive }) =>
                    `notification-tab ${isActive ? "active" : ""}`
                }
            >
                Events
            </NavLink>

            <NavLink
                to="/settings/notifications/event-mapping"
                className={({ isActive }) =>
                    `notification-tab ${isActive ? "active" : ""}`
                }
            >
                Event Mapping
            </NavLink>

            <NavLink
                to="/settings/notifications/templates"
                className={({ isActive }) =>
                    `notification-tab ${isActive ? "active" : ""}`
                }
            >
                Templates
            </NavLink>
        </div>
    );
}

export default NotificationTabs;
