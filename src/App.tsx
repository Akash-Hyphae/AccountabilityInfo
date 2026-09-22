import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import { DateProvider } from './context/DateContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { SidebarProvider } from './context/SidebarContext.tsx';
import { ProtectedRoute } from './components/common/ProtectedRoute.tsx';
import { AppLayout } from './components/layout/AppLayout.tsx';

import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { AccountabilityPage } from './pages/AccountabilityPage.tsx';
import { AnalyticsPage } from './pages/AnalyticsPage.tsx';
import { AiAnalysisPage } from './pages/AiAnalysisPage.tsx';
import { GoalsPage } from './pages/GoalsPage.tsx';
import { HabitsPage } from './pages/HabitsPage.tsx';
import { FocusPage } from './pages/FocusPage.tsx';
import { NotesPage } from './pages/NotesPage.tsx';
import { CalendarPage } from './pages/CalendarPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DateProvider>
          <SidebarProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected App Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  {/* Default route opens the core Accountability Sheet directly */}
                  <Route index element={<Navigate to="/accountability" replace />} />
                  <Route path="accountability" element={<AccountabilityPage />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="ai-analysis" element={<AiAnalysisPage />} />
                  <Route path="goals" element={<GoalsPage />} />
                  <Route path="habits" element={<HabitsPage />} />
                  <Route path="focus" element={<FocusPage />} />
                  <Route path="notes" element={<NotesPage />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/accountability" replace />} />
              </Routes>
            </BrowserRouter>
          </SidebarProvider>
        </DateProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
