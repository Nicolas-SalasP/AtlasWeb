import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute'; // <--- EL GUARDIA

// Componentes
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Páginas Públicas
import Home from './pages/Home';
import Proyectos from './pages/Proyectos';
import Catalogo from './pages/Catalogo';
import Servicios from './pages/Servicios';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Recuperar from './pages/Recuperar';
import MisTickets from './pages/MisTickets';

// Páginas Admin
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductos from './pages/admin/AdminProductos';
import AdminPedidos from './pages/admin/AdminPedidos';
import AdminConfig from './pages/admin/AdminConfig';
import AdminUsuarios from './pages/admin/AdminUsuarios';
import AdminTickets from './pages/admin/AdminTickets';

// Layout Público (Navbar + Footer)
const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Navbar />
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
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/proyectos" element={<Proyectos />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/recuperar" element={<Recuperar />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/mis-tickets" element={<MisTickets />} />
            </Route>
          </Route>
          
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

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;