import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Loader2 } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SystemAlert from './components/SystemAlert';

const Home = lazy(() => import('./pages/Home'));
const Proyectos = lazy(() => import('./pages/Proyectos'));
const Catalogo = lazy(() => import('./pages/Catalogo'));
const Servicios = lazy(() => import('./pages/Servicios'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Registro = lazy(() => import('./pages/Registro'));
const Recuperar = lazy(() => import('./pages/Recuperar'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
const MisTickets = lazy(() => import('./pages/MisTickets'));
const UserProfile = lazy(() => import('./pages/UserProfile')); 
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProductos = lazy(() => import('./pages/admin/AdminProductos'));
const AdminPedidos = lazy(() => import('./pages/admin/AdminPedidos'));
const AdminConfig = lazy(() => import('./pages/admin/AdminConfig'));
const AdminUsuarios = lazy(() => import('./pages/admin/AdminUsuarios'));
const AdminTickets = lazy(() => import('./pages/admin/AdminTickets'));

// Loader
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-50 text-atlas-900">
    <Loader2 className="animate-spin" size={40} />
  </div>
);

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
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            
            <Route path="/mantenimiento" element={<Maintenance />} />

            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/proyectos" element={<Proyectos />} />
              <Route path="/catalogo" element={<Catalogo />} />
              <Route path="/servicios" element={<Servicios />} />
              <Route path="/checkout/*" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/recuperar" element={<Recuperar />} />

              {/* RUTAS PROTEGIDAS (Usuarios Logueados) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/mis-tickets" element={<MisTickets />} />
                <Route path="/perfil" element={<UserProfile />} />
              </Route>
            </Route>

            {/* RUTAS ADMIN*/}
            <Route element={<ProtectedRoute requiredRole={1} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="productos" element={<AdminProductos />} />
                <Route path="pedidos" element={<AdminPedidos />} />
                <Route path="configuracion" element={<AdminConfig />} />
                <Route path="usuarios" element={<AdminUsuarios />} />
                <Route path="tickets" element={<AdminTickets />} />
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