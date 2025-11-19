import { BrowserRouter, Navigate, Route, Routes, useLocation, NavLink } from "react-router-dom";

import DownloadPage from "./pages/Download.jsx";
import ProcessPage from "./pages/Process.jsx";
import UploadPage from "./pages/Upload.jsx";
import "./styles/theme.css";

const steps = [
  { label: "Upload", path: "/" },
  { label: "Configure", path: "/process" },
  { label: "Download", path: "/download" },
];

const WorkflowHeader = () => {
  const location = useLocation();
  const activeIndex = Math.max(
    steps.findIndex((item) => item.path === location.pathname),
    0
  );

  return (
    <nav className="flex flex-wrap items-center gap-6 rounded-2xl border border-white/5 bg-white/5 p-4 text-sm font-semibold text-slate-300">
      {steps.map((step, index) => {
        const isActive = location.pathname === step.path;
        const isCompleted = index < activeIndex;
        return (
          <div key={step.path} className="flex items-center gap-3">
            <NavLink
              to={step.path}
              className={`rounded-full px-4 py-2 transition ${
                isActive ? "bg-accent text-slate-900" : isCompleted ? "bg-white/10 text-white" : "bg-white/5"
              }`}
            >
              {index + 1}. {step.label}
            </NavLink>
            {index < steps.length - 1 && <span className="text-white/30">•••</span>}
          </div>
        );
      })}
    </nav>
  );
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-white">
        <main className="mx-auto max-w-6xl px-4 py-12">
          <WorkflowHeader />
          <div className="mt-10">
            <Routes>
              <Route path="/" element={<UploadPage />} />
              <Route path="/process" element={<ProcessPage />} />
              <Route path="/download" element={<DownloadPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
