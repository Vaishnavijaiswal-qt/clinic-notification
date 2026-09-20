import { NavLink } from "react-router-dom";
import "./Header.css";

function Header() {
  return (
    <header className="header">
      <div className="brand">
        <div className="brand-text">
        </div>
      </div>

      <nav className="navigation">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Settings
        </NavLink>

        <NavLink
          to="/send-message"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Send Message
        </NavLink>

        <NavLink
          to="/templates"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Templates
        </NavLink>
      </nav>
    </header>
  );
}

export default Header;