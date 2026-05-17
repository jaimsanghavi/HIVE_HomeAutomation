import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { isAuthenticated } from "./api/client";
import ErrorBoundary from "./components/ErrorBoundary";
import type { FC, ReactNode } from "react";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import RoomsPage from "./pages/RoomsPage";
import RoomDetailPage from "./pages/RoomDetailPage";
import DeviceDetailPage from "./pages/DeviceDetailPage";
import ScenesPage from "./pages/ScenesPage";
import SettingsPage from "./pages/SettingsPage";

const RequireAuth: FC<{ children: ReactNode }> = ({ children }) => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<RequireAuth><DashboardPage /></RequireAuth>} />
            <Route path="/rooms" element={<RequireAuth><RoomsPage /></RequireAuth>} />
            <Route path="/rooms/:roomId" element={<RequireAuth><RoomDetailPage /></RequireAuth>} />
            <Route path="/devices/:deviceId" element={<RequireAuth><DeviceDetailPage /></RequireAuth>} />
            <Route path="/scenes" element={<RequireAuth><ScenesPage /></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
