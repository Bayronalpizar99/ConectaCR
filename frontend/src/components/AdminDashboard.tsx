import { useState, useRef, useCallback, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertCircle, CheckCircle2, Clock, LogOut, MapPin, Filter, BarChart3, UserCircle } from 'lucide-react';
import { User, Report, ReportStatus, ReportCategory, CATEGORY_LABELS, STATUS_LABELS } from '../types';
import RealMap from './RealMap';
import ReportDetailsDialog from './ReportDetailsDialog';
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

interface AdminDashboardProps {
  user: User;
  reports: Report[];
  onUpdateStatus: (reportId: string, newStatus: ReportStatus) => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function AdminDashboard({ user, reports, onUpdateStatus, onLogout, theme, onToggleTheme }: AdminDashboardProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<ReportCategory | 'all'>('all');
  const geolocation = useGeolocation();
  const userLocation = geolocation.latitude && geolocation.longitude ? { lat: geolocation.latitude, lng: geolocation.longitude } : null;
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'map' | 'stats'>('overview');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const hoverTimeoutRef = useRef<number | null>(null);


  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      if (categoryFilter !== 'all' && report.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && report.status !== statusFilter) return false;
      return true;
    });
  }, [reports, categoryFilter, statusFilter]);

  const handleReportClick = useCallback((report: Report) => {
    setSelectedReport(report);
    setDetailsDialogOpen(true);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalReports = reports.length;
  const recibidos = reports.filter(r => r.status === 'recibido').length;
  const enProgreso = reports.filter(r => r.status === 'en_progreso').length;
  const resueltos = reports.filter(r => r.status === 'resuelto').length;

  // Category statistics
  const categoryStats = Object.keys(CATEGORY_LABELS).map(cat => ({
    category: cat as ReportCategory,
    count: reports.filter(r => r.category === cat).length
  })).sort((a, b) => b.count - a.count);

  const handleProfileMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setProfileMenuOpen(true);
  };

  const handleProfileMouseLeave = () => {
    hoverTimeoutRef.current = window.setTimeout(() => {
      setProfileMenuOpen(false);
    }, 200);
  };

  const mapTabContent = useMemo(
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
                <CardTitle>Mapa de Incidencias</CardTitle>
                <CardDescription>Visualización geográfica de todos los reportes</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-600" />
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
            <div className="h-[600px] rounded-lg overflow-hidden">
              <RealMap
                reports={filteredReports}
                onReportClick={handleReportClick}
                interactive={true}
                userLocation={userLocation}
                isVisible={activeTab === 'map'}
              />
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-slate-600">Recibido ({recibidos})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span className="text-slate-600">En Progreso ({enProgreso})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-slate-600">Resuelto ({resueltos})</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    ),
    [activeTab, categoryFilter, filteredReports, handleReportClick, userLocation, recibidos, enProgreso, resueltos],
  );
  return (
    <div className="min-h-screen bg-background">
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
                <p className="text-muted-foreground">Panel de Administración</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle theme={theme} onToggle={onToggleTheme} />
              <DropdownMenu open={profileMenuOpen} onOpenChange={setProfileMenuOpen} modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="relative"
                    aria-label="Perfil"
                    onMouseEnter={handleProfileMouseEnter}
                    onMouseLeave={handleProfileMouseLeave}
                  >
                    <UserCircle className="h-[1.2rem] w-[1.2rem]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-64"
                  onMouseEnter={handleProfileMouseEnter}
                  onMouseLeave={handleProfileMouseLeave}
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Total Reportes</CardDescription>
                <BarChart3 className="w-4 h-4 text-slate-600" />
              </div>
              <CardTitle>{totalReports}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Recibidos</CardDescription>
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <CardTitle className="text-red-600">{recibidos}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>En Progreso</CardDescription>
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <CardTitle className="text-orange-600">{enProgreso}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Resueltos</CardDescription>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <CardTitle className="text-green-600">{resueltos}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as 'overview' | 'reports' | 'map' | 'stats')
          }
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="overview">Vista General</TabsTrigger>
            <TabsTrigger value="reports">Gestión de Reportes</TabsTrigger>
            <TabsTrigger value="map">Mapa</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reportes Recientes</CardTitle>
                  <CardDescription>Últimos 5 reportes recibidos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reports.slice(0, 5).map((report) => (
                      <div 
                        key={report.id}
                        className="p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => handleReportClick(report)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-slate-900">{report.title}</p>
                          <Badge 
                            variant={
                              report.status === 'resuelto' ? 'default' : 
                              report.status === 'en_progreso' ? 'secondary' : 
                              'destructive'
                            }
                            className="text-xs"
                          >
                            {STATUS_LABELS[report.status]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <span>{CATEGORY_LABELS[report.category]}</span>
                          <span>•</span>
                          <span>{formatDate(report.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reportes Pendientes</CardTitle>
                  <CardDescription>Requieren atención inmediata</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reports.filter(r => r.status === 'recibido').slice(0, 5).map((report) => (
                      <div 
                        key={report.id}
                        className="p-3 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 cursor-pointer transition-colors"
                        onClick={() => handleReportClick(report)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-slate-900">{report.title}</p>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <span>{CATEGORY_LABELS[report.category]}</span>
                          <span>•</span>
                          <span>{report.userName}</span>
                        </div>
                      </div>
                    ))}
                    {reports.filter(r => r.status === 'recibido').length === 0 && (
                      <p className="text-slate-600 text-center py-4">No hay reportes pendientes</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestión de Reportes</CardTitle>
                    <CardDescription>
                      Administra y actualiza el estado de todos los reportes
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-600" />
                    <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as ReportCategory | 'all')}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ReportStatus | 'all')}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>Ciudadano</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id} className="cursor-pointer hover:bg-slate-50">
                        <TableCell 
                          className="text-slate-900"
                          onClick={() => handleReportClick(report)}
                        >
                          {report.title}
                        </TableCell>
                        <TableCell onClick={() => handleReportClick(report)}>
                          {CATEGORY_LABELS[report.category]}
                        </TableCell>
                        <TableCell 
                          className="max-w-[200px] truncate"
                          onClick={() => handleReportClick(report)}
                        >
                          {report.location.address}
                        </TableCell>
                        <TableCell onClick={() => handleReportClick(report)}>
                          {report.userName}
                        </TableCell>
                        <TableCell onClick={() => handleReportClick(report)}>
                          {formatDate(report.createdAt)}
                        </TableCell>
                        <TableCell onClick={() => handleReportClick(report)}>
                          <Badge 
                            variant={
                              report.status === 'resuelto' ? 'default' : 
                              report.status === 'en_progreso' ? 'secondary' : 
                              'destructive'
                            }
                          >
                            {STATUS_LABELS[report.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={report.status} 
                            onValueChange={(value) => onUpdateStatus(report.id, value as ReportStatus)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {mapTabContent}

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reportes por Categoría</CardTitle>
                  <CardDescription>Distribución de incidencias por tipo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryStats.map((stat) => (
                      <div key={stat.category} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-slate-900">{CATEGORY_LABELS[stat.category]}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(stat.count / totalReports) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-slate-900 min-w-[40px] text-right">{stat.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estado de Resolución</CardTitle>
                  <CardDescription>Progreso de atención a reportes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-900">Tasa de Resolución</span>
                        <span className="text-slate-900">
                          {totalReports > 0 ? Math.round((resueltos / totalReports) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-4">
                        <div 
                          className="bg-green-600 h-4 rounded-full transition-all"
                          style={{ width: `${totalReports > 0 ? (resueltos / totalReports) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <span className="text-slate-900">Recibidos</span>
                        </div>
                        <span className="text-slate-900">{recibidos}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-orange-600" />
                          <span className="text-slate-900">En Progreso</span>
                        </div>
                        <span className="text-slate-900">{enProgreso}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span className="text-slate-900">Resueltos</span>
                        </div>
                        <span className="text-slate-900">{resueltos}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Details Dialog */}
      <ReportDetailsDialog 
        report={selectedReport}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />
    </div>
  );
}