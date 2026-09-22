import { NavLink } from "react-router-dom";

function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-title">ClinicalX</div>

            <nav className="sidebar-nav">
                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `sidebar-link ${isActive ? "active" : ""}`
                    }
                >
                    Settings
                </NavLink>

                <NavLink
                    to="/notification-management"
                    className={({ isActive }) =>
                        `sidebar-link ${isActive ? "active" : ""}`
                    }
                >
                    Notification Management
                </NavLink>
            </nav>
        </aside>
    );
}

export default Sidebar;