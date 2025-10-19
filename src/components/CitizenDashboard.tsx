import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Plus, MapPin, List, LogOut, Filter } from 'lucide-react';
import { User, Report, CATEGORY_LABELS, STATUS_LABELS, ReportCategory } from '../types';
import SimpleMap from './SimpleMap';
import CreateReportDialog from './CreateReportDialog';
import ReportDetailsDialog from './ReportDetailsDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import ThemeToggle from './ThemeToggle';

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

  const myReports = reports.filter(r => r.userId === user.id);
  
  const filteredReports = categoryFilter === 'all' 
    ? reports 
    : reports.filter(r => r.category === categoryFilter);

  const handleReportClick = (report: Report) => {
    setSelectedReport(report);
    setDetailsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

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
                <p className="text-muted-foreground">Panel Ciudadano</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-foreground">{user.name}</p>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              <ThemeToggle theme={theme} onToggle={onToggleTheme} />
              <Button variant="outline" size="icon" onClick={onLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
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
              <CardDescription>Mis Reportes</CardDescription>
              <CardTitle>{myReports.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Recibidos</CardDescription>
              <CardTitle>{myReports.filter(r => r.status === 'recibido').length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>En Progreso</CardDescription>
              <CardTitle>{myReports.filter(r => r.status === 'en_progreso').length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Resueltos</CardDescription>
              <CardTitle>{myReports.filter(r => r.status === 'resuelto').length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="map" className="space-y-4">
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

            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Reporte
            </Button>
          </div>

          <TabsContent value="map" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Mapa de Incidencias</CardTitle>
                    <CardDescription>
                      Visualiza todos los reportes en el mapa. Haz clic en un marcador para ver detalles.
                    </CardDescription>
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
                <div className="h-[500px] rounded-lg overflow-hidden">
                  <SimpleMap 
                    reports={filteredReports} 
                    onReportClick={handleReportClick}
                  />
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="text-slate-600">Recibido</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                    <span className="text-slate-600">En Progreso</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-slate-600">Resuelto</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Mis Reportes</CardTitle>
                <CardDescription>
                  Seguimiento de todos los reportes que has creado
                </CardDescription>
              </CardHeader>
              <CardContent>
                {myReports.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-600">No has creado ningún reporte aún</p>
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
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => handleReportClick(report)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-slate-900">{report.title}</h3>
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
                          <div className="flex items-center gap-4 text-slate-600">
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
                    <CardTitle>Todos los Reportes</CardTitle>
                    <CardDescription>
                      Visualiza todos los reportes de la comunidad
                    </CardDescription>
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
                <div className="space-y-3">
                  {filteredReports.map((report) => (
                    <div 
                      key={report.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => handleReportClick(report)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-slate-900">{report.title}</h3>
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
                        <div className="flex items-center gap-4 text-slate-600">
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

      {/* Dialogs */}
      <CreateReportDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={onCreateReport}
      />

      <ReportDetailsDialog 
        report={selectedReport}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />
    </div>
  );
}
