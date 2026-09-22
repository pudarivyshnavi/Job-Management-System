import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Header({ publicMode = false }) {
  const { user, signOut } = useAuth();
  return (
    <header className="site-header">
      <div className="header-inner">
        <NavLink to={publicMode ? "/" : "/dashboard"} className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 9.5V7.8A2.8 2.8 0 0 1 7.8 5h8.4A2.8 2.8 0 0 1 19 7.8v1.7" />
              <rect x="4" y="8" width="16" height="11" rx="2.5" />
              <path d="M8 13h8" />
            </svg>
          </span>
          <span className="brand-text">jobboard<span className="brand-dot">.</span></span>
        </NavLink>
        <nav aria-label="Main navigation">
          {publicMode ? <><NavLink to="/jobs" className="nav-link">Browse roles</NavLink><NavLink to="/help" className="nav-link">Help</NavLink><NavLink to="/login" className="nav-link nav-cta">Recruiter login</NavLink></> : <><NavLink to="/jobs" className="nav-link">Public view</NavLink><NavLink to="/help" className="nav-link">Help</NavLink><NavLink to="/jobs/new" className="nav-link nav-cta">+ Create role</NavLink><span className="header-user">{user?.name || "Recruiter"}</span><button type="button" className="btn btn-small" onClick={signOut}>Log out</button></>}
        </nav>
      </div>
    </header>
  );
}

export default Header;
