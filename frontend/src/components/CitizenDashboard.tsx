import { useState, useRef, useCallback, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Plus, MapPin, List, LogOut, Filter, UserCircle } from 'lucide-react';
import { User, Report, CATEGORY_LABELS, STATUS_LABELS, ReportCategory } from '../types';
import RealMap from './RealMap';
import CreateReportDialog from './CreateReportDialog';
import ReportDetailsDialog from './ReportDetailsDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import ThemeToggle from './ThemeToggle';
import { useGeolocation } from '../hooks/useGeolocation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface CitizenDashboardProps {
  user: User;
  reports: Report[];
  onCreateReport: (report: Omit<Report, 'id' | 'userId' | 'userName' | 'createdAt' | 'updatedAt'>) => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function CitizenDashboard({ user, reports, onCreateReport, onLogout, theme, onToggleTheme }: CitizenDashboardProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<ReportCategory | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'map' | 'my-reports' | 'all-reports'>('map');
  const geolocation = useGeolocation();
  const userLocation = geolocation.latitude && geolocation.longitude ? { lat: geolocation.latitude, lng: geolocation.longitude } : null;

  const filteredReports = useMemo(() => {
    return categoryFilter === 'all' ? reports : reports.filter(r => r.category === categoryFilter);
  }, [reports, categoryFilter]);

  const myReports = useMemo(() => {
    return reports.filter(r => r.userId === user.id);
  }, [reports, user.id]);

  const handleReportClick = useCallback((report: Report) => {
    setSelectedReport(report);
    setDetailsDialogOpen(true);
  }, []);

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const hoverTimeoutRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setProfileMenuOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = window.setTimeout(() => {
      setProfileMenuOpen(false);
    }, 200);
  };

  const mapSection = useMemo(
    () => (
      <TabsContent
        value="map"
        className="space-y-4"
        forceMount
        style={{ display: activeTab === 'map' ? 'block' : 'none' }}
      >
        <Card style={{ display: activeTab === 'map' ? 'block' : 'none' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Mapa de Incidencias</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Visualiza todos los reportes en el mapa. Haz clic en un marcador para ver detalles.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as ReportCategory | 'all')}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] rounded-lg overflow-hidden">
              <RealMap
                reports={filteredReports}
                onReportClick={handleReportClick}
                userLocation={userLocation}
                interactive={true}
                isVisible={activeTab === 'map'}
              />
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full" />
                <span className="text-muted-foreground">Recibido</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full" />
                <span className="text-muted-foreground">En Progreso</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full" />
                <span className="text-muted-foreground">Resuelto</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    ),
    [activeTab, categoryFilter, filteredReports, handleReportClick, userLocation],
  );

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg">
                <MapPin className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-foreground">Asistente de Mantenimiento</h1>
                <p className="text-muted-foreground">Panel Ciudadano</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle theme={theme} onToggle={onToggleTheme} />
              <DropdownMenu open={profileMenuOpen} onOpenChange={setProfileMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="p-0 h-10 w-10 rounded-full border border-border hover:bg-muted inline-flex items-center justify-center bg-background text-foreground"
                    aria-label="Perfil"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <UserCircle className="w-8 h-8 text-primary" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-64"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <DropdownMenuLabel>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-xs text-muted-foreground break-words">{user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-1">Rol: {user.role}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={(e) => {
                      e.preventDefault();
                      onLogout();
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Main Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as 'map' | 'my-reports' | 'all-reports')
          }
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Mapa
              </TabsTrigger>
              <TabsTrigger value="my-reports" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                Mis Reportes
              </TabsTrigger>
              <TabsTrigger value="all-reports" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                Todos los Reportes
              </TabsTrigger>
            </TabsList>
          </div>

          {mapSection}

          <TabsContent value="my-reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Mis Reportes</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Seguimiento de todos los reportes que has creado
                </CardDescription>
              </CardHeader>
              <CardContent>
                {myReports.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No has creado ningún reporte aún</p>
                    <Button onClick={() => setCreateDialogOpen(true)} className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Crear primer reporte
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myReports.map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => handleReportClick(report)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-foreground">{report.title}</h3>
                            <Badge
                              variant={
                                report.status === 'resuelto' ? 'default' :
                                report.status === 'en_progreso' ? 'secondary' :
                                'destructive'
                              }
                            >
                              {STATUS_LABELS[report.status]}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-muted-foreground">
                            <span>{CATEGORY_LABELS[report.category]}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {report.location.address}
                            </span>
                            <span>•</span>
                            <span>{formatDate(report.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all-reports" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground">Todos los Reportes</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Visualiza todos los reportes de la comunidad
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as ReportCategory | 'all')}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => handleReportClick(report)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-foreground">{report.title}</h3>
                          <Badge
                            variant={
                              report.status === 'resuelto' ? 'default' :
                              report.status === 'en_progreso' ? 'secondary' :
                              'destructive'
                            }
                          >
                            {STATUS_LABELS[report.status]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <span>{CATEGORY_LABELS[report.category]}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {report.location.address}
                          </span>
                          <span>•</span>
                          <span>{formatDate(report.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* FAB centrado en la ventana */}
      <button
        type="button"
        className="fab"
        onClick={() => setCreateDialogOpen(true)}
        aria-label="Nuevo Reporte"
      >
        <Plus className="w-5 h-5" />
        <span>Nuevo Reporte</span>
      </button>

      {/* Dialogs */}
      <CreateReportDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSubmit={onCreateReport} />
      <ReportDetailsDialog report={selectedReport} open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen} />
    </div>
  );
}
