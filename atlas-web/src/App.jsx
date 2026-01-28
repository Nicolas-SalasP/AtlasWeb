import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Proyectos from './pages/Proyectos';

const Catalogo = () => <div className="pt-24 text-center text-2xl">Tienda / Catálogo (En construcción)</div>;
const Servicios = () => <div className="pt-24 text-center text-2xl">Nuestros Servicios (En construcción)</div>;

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/proyectos" element={<Proyectos />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/servicios" element={<Servicios />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;