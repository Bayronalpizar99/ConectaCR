import { useState, useEffect } from 'react';
import { User, Report, ReportStatus } from './types';
import { getCurrentUser, saveCurrentUser, getReports, saveReports } from './utils/mockData';
import LoginPage from './components/LoginPage';
import CitizenDashboard from './components/CitizenDashboard';
import AdminDashboard from './components/AdminDashboard';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();

  // Load user and reports on mount
  useEffect(() => {
    const user = getCurrentUser();
    const loadedReports = getReports();
    
    setCurrentUser(user);
    setReports(loadedReports);
    setIsLoading(false);
  }, []);

  // Save reports whenever they change
  useEffect(() => {
    if (!isLoading) {
      saveReports(reports);
    }
  }, [reports, isLoading]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveCurrentUser(null);
  };

  const handleCreateReport = (newReportData: Omit<Report, 'id' | 'userId' | 'userName' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) return;

    const newReport: Report = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      ...newReportData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setReports(prev => [newReport, ...prev]);
  };

  const handleUpdateStatus = (reportId: string, newStatus: ReportStatus) => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, status: newStatus, updatedAt: new Date().toISOString() }
        : report
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (currentUser.role === 'admin') {
    return (
      <AdminDashboard 
        user={currentUser}
        reports={reports}
        onUpdateStatus={handleUpdateStatus}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <CitizenDashboard 
      user={currentUser}
      reports={reports}
      onCreateReport={handleCreateReport}
      onLogout={handleLogout}
      theme={theme}
      onToggleTheme={toggleTheme}
    />
  );
}
