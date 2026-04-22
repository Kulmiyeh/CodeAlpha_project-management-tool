import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { AppLayout } from './layouts/AppLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { BoardPage } from './pages/BoardPage';
import { ProfilePage } from './pages/ProfilePage';
import { InvitesPage } from './pages/InvitesPage';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const initTheme = useThemeStore((s) => s.init);

  useEffect(() => {
    initTheme();
    fetchMe();
  }, [fetchMe, initTheme]);

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id/board" element={<BoardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/invites" element={<InvitesPage />} />
        <Route path="/invites/:token" element={<InvitesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
