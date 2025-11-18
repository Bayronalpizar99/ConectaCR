import { useState, useEffect } from 'react';
import { User, Report, ReportStatus } from './types';
import { getCurrentUser, saveCurrentUser } from './utils/mockData';
import LoginPage from './components/LoginPage';
import CitizenDashboard from './components/CitizenDashboard';
import AdminDashboard from './components/AdminDashboard';
import { useTheme } from './hooks/useTheme';
import { reportService } from './services/report.service';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    const fetchReports = async () => {
      try {
        const data = await reportService.getReports();
        setReports(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los reportes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveCurrentUser(null);
  };

  const handleCreateReport = async (newReportData: Omit<Report, 'id' | 'userId' | 'userName' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) return;

    const { imageFile: _imageFile, imageDataUrl, ...rest } = newReportData as any;

    try {
      const payload = {
        ...rest,
        userId: currentUser.id,
        userName: currentUser.name,
        imageDataUrl: imageDataUrl ?? undefined,
      } as Omit<Report, 'id' | 'createdAt' | 'updatedAt'> & { imageDataUrl?: string };

      const createdReport = await reportService.createReport(payload);
      setReports(prev => [createdReport, ...prev]);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'No se pudo crear el reporte');
    }
  };

  const handleUpdateStatus = async (reportId: string, newStatus: ReportStatus) => {
    try {
      const updatedReport = await reportService.updateStatus(reportId, newStatus);
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? updatedReport
          : report
      ));
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el estado del reporte');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">Cargando...</p>
          {error && <p className="text-destructive">{error}</p>}
        </div>
      </div>
    );
  }

  const errorBanner = error ? (
    <div className="w-full bg-destructive/90 text-destructive-foreground text-center py-2 px-4">
      {error}
    </div>
  ) : null;

  let content: JSX.Element;

  if (!currentUser) {
    content = <LoginPage onLogin={handleLogin} />;
  } else if (currentUser.role === 'admin') {
    content = (
      <AdminDashboard 
        user={currentUser}
        reports={reports}
        onUpdateStatus={handleUpdateStatus}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  } else {
    content = (
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

  return (
    <>
      {errorBanner}
      {content}
    </>
  );
}
