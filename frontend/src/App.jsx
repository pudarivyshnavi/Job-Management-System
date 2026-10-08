import { NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header.jsx";
import Landing from "./pages/Landing.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ModulePage from "./pages/ModulePage.jsx";
import AIAssistant from "./pages/AIAssistant.jsx";
import Matching from "./pages/Matching.jsx";
import ResumeAnalysis from "./pages/ResumeAnalysis.jsx";
import Applications from "./pages/Applications.jsx";
import Interviews from "./pages/Interviews.jsx";
import HelpPage from "./pages/HelpPage.jsx";
import CreateJobPage from "./pages/CreateJob.jsx";
import EditJobPage from "./pages/EditJob.jsx";
import JobDetailsPage from "./pages/JobDetails.jsx";
import JobsListPage from "./pages/JobsList.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function Protected({ children }) {
  const { loading, isAuthenticated } = useAuth();
  if (loading) return <main className="auth-page"><p className="state-message">Checking your session...</p></main>;
  return isAuthenticated ? children : <Navigate to="/login" replace state={{ message: "Please sign in to access the recruiter workspace." }} />;
}

function App() {
  const location = useLocation();
  const publicPage = location.pathname === "/" || location.pathname === "/jobs" || /^\/jobs\/\d+$/.test(location.pathname) || location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/help";

  const primaryLinks = [
    ["/dashboard", "Overview"],
    ["/jobs", "Jobs"],
    ["/ai-assistant", "AI assistant"],
    ["/candidates", "Candidates"],
    ["/ai-matching", "AI matching"],
    ["/resume-analysis", "Resume analysis"],
    ["/applications", "Applications"],
    ["/interviews", "Interviews"],
    ["/analytics", "Analytics"],
    ["/notifications", "Notifications"],
  ];

  const secondaryLinks = [
    ["/activity", "Activity"],
    ["/users", "Users & roles"],
    ["/settings", "Settings"],
    ["/help", "Help"],
  ];

  if (publicPage) {
    return <><Header publicMode /><main className="public-content"><Routes><Route path="/" element={<Landing />} /><Route path="/jobs" element={<JobsListPage />} /><Route path="/jobs/:id" element={<JobDetailsPage />} /><Route path="/login" element={<Login />} /><Route path="/signup" element={<Signup />} /><Route path="/help" element={<HelpPage />} /></Routes></main></>;
  }

  return (
    <>
      <Header />
      <main className="page-content workspace-content">
        <Protected>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/jobs" element={<JobsListPage />} />
            <Route path="/jobs/new" element={<CreateJobPage />} />
            <Route path="/jobs/:id" element={<JobDetailsPage />} />
            <Route path="/jobs/:id/edit" element={<EditJobPage />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/ai-matching" element={<Matching />} />
            <Route path="/resume-analysis" element={<ResumeAnalysis />} />
            <Route path="/candidates" element={<ModulePage type="candidates" />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/notifications" element={<ModulePage type="notifications" />} />
            <Route path="/interviews" element={<Interviews />} />
            <Route path="/analytics" element={<Dashboard />} />
            <Route path="/activity" element={<ModulePage type="notifications" />} />
            <Route path="/users" element={<ModulePage type="candidates" />} />
            <Route path="/settings" element={<AIAssistant />} />
            <Route path="/help" element={<HelpPage />} />
          </Routes>
        </Protected>
      </main>
    </>
  );
}

export default App;
