import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Loader2 } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SystemAlert from './components/SystemAlert';
import api from './api/axiosConfig';
import Terminos from './pages/legal/Terminos';
import Privacidad from './pages/legal/Privacidad';
import SLA from './pages/legal/SLA';
import Seguridad from './pages/legal/Seguridad';
import ScrollToTop from './components/ScrollToTop';

// Lazy Imports
const Home = lazy(() => import('./pages/Home'));
const Proyectos = lazy(() => import('./pages/Proyectos'));
const Catalogo = lazy(() => import('./pages/Catalogo'));
const Servicios = lazy(() => import('./pages/Servicios'));
const ItemDetail = lazy(() => import('./pages/ItemDetail'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Registro = lazy(() => import('./pages/Registro'));
const Recuperar = lazy(() => import('./pages/Recuperar'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
const MisTickets = lazy(() => import('./pages/MisTickets'));
const UserProfile = lazy(() => import('./pages/UserProfile')); 

// Admin Imports
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProductos = lazy(() => import('./pages/admin/AdminProductos'));
const AdminPedidos = lazy(() => import('./pages/admin/AdminPedidos'));
const AdminConfig = lazy(() => import('./pages/admin/AdminConfig'));
const AdminUsuarios = lazy(() => import('./pages/admin/AdminUsuarios'));
const AdminTickets = lazy(() => import('./pages/admin/AdminTickets'));
const AdminServices = lazy(() => import('./pages/admin/AdminServices'));

// Loader Component
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-50 text-tenri-900">
    <Loader2 className="animate-spin" size={40} />
  </div>
);

// Layout Público (Navbar + Footer)
const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Navbar />
      <SystemAlert />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

function App() {
  useEffect(() => {
    const interval = setInterval(async () => {
      const currentPath = window.location.pathname;
      if (currentPath === '/mantenimiento' || currentPath.startsWith('/admin')) {
        return;
      }

      try {
        const response = await api.get('/system-status');
        if (response.data.maintenance_mode == '1' || response.data.maintenance_mode === true) {
          window.location.href = '/mantenimiento';
        }
      } catch (error) {
        if (error.response && error.response.status === 503) {
            window.location.href = '/mantenimiento';
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            
            <Route path="/mantenimiento" element={<Maintenance />} />

            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/proyectos" element={<Proyectos />} />
              <Route path="/catalogo" element={<Catalogo />} />
              <Route path="/servicios" element={<Servicios />} />
              <Route path="/item/:type/:id" element={<ItemDetail />} /> 
              <Route path="/checkout/*" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/recuperar" element={<Recuperar />} />
              <Route path="/terminos-y-condiciones" element={<Terminos />} />
              <Route path="/politica-privacidad" element={<Privacidad />} />
              <Route path="/acuerdo-nivel-servicio" element={<SLA />} />
              <Route path="/seguridad-informacion" element={<Seguridad />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/mis-tickets" element={<MisTickets />} />
                <Route path="/perfil" element={<UserProfile />} />
              </Route>
            </Route>

            {/* RUTAS DE ADMINISTRADOR */}
            <Route element={<ProtectedRoute requiredRole={1} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="productos" element={<AdminProductos />} />
                <Route path="services" element={<AdminServices />} />
                <Route path="pedidos" element={<AdminPedidos />} />
                <Route path="usuarios" element={<AdminUsuarios />} />
                <Route path="tickets" element={<AdminTickets />} />
                <Route path="configuracion" element={<AdminConfig />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;