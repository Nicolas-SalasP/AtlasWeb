import React, { useState } from 'react';
import { Search, ShoppingCart, Filter, Box, ChevronDown, ArrowUpDown } from 'lucide-react';

// 📦 BASE DE DATOS SIMULADA (Pronto vendrá de tu Admin Panel)
const PRODUCTOS_INICIALES = [
    {
        id: 1,
        nombre: "Kit 4 Cámaras Hilook 1080p + DVR",
        categoria: "Seguridad",
        precio: 149990,
        stock: 5,
        imagen: "https://images.unsplash.com/photo-1557324232-b8917d3c3d63?auto=format&fit=crop&q=80&w=400&h=300",
        destacado: true
    },
    {
        id: 2,
        nombre: "Router MikroTik hAP ac2 Dual Band",
        categoria: "Redes",
        precio: 65990,
        stock: 12,
        imagen: "https://images.unsplash.com/photo-1544197150-b99a580bbcbf?auto=format&fit=crop&q=80&w=400&h=300",
        destacado: false
    },
    {
        id: 3,
        nombre: "Bobina Cable UTP Cat6 305m",
        categoria: "Infraestructura",
        precio: 89900,
        stock: 20,
        imagen: "https://images.unsplash.com/photo-1558494949-ef526b0042a0?auto=format&fit=crop&q=80&w=400&h=300",
        destacado: false
    },
    {
        id: 4,
        nombre: "Licencia Anual Atlas ERP Pyme",
        categoria: "Software",
        precio: 299000,
        stock: 99,
        imagen: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400&h=300",
        destacado: true
    },
    {
        id: 5,
        nombre: "Switch PoE 8 Puertos Gigabit",
        categoria: "Redes",
        precio: 45000,
        stock: 8,
        imagen: "https://images.unsplash.com/photo-1517430816045-df4b7de8db69?auto=format&fit=crop&q=80&w=400&h=300",
        destacado: false
    },
    {
        id: 6,
        nombre: "Cámara IP Dome 4MP Exterior",
        categoria: "Seguridad",
        precio: 52990,
        stock: 0,
        imagen: "https://images.unsplash.com/photo-1588619461332-445393bef62e?auto=format&fit=crop&q=80&w=400&h=300",
        destacado: false
    }
];

const CATEGORIAS = ["Todos", "Seguridad", "Redes", "Infraestructura", "Software"];

const Catalogo = () => {
    const [filtroCategoria, setFiltroCategoria] = useState("Todos");
    const [busqueda, setBusqueda] = useState("");
    const [orden, setOrden] = useState("relevantes"); // Estado para el ordenamiento

    // Lógica combinada: Filtrar y luego Ordenar
    const productosProcesados = PRODUCTOS_INICIALES
        // 1. FILTRADO
        .filter(producto => {
            const coincideCategoria = filtroCategoria === "Todos" || producto.categoria === filtroCategoria;
            const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase());
            return coincideCategoria && coincideBusqueda;
        })
        // 2. ORDENAMIENTO
        .sort((a, b) => {
            if (orden === "menor_mayor") return a.precio - b.precio;
            if (orden === "mayor_menor") return b.precio - a.precio;
            if (orden === "relevantes") return (b.destacado === true) - (a.destacado === true); // Destacados primero
            return 0;
        });

    return (
        <div className="bg-white min-h-screen pt-20">

            {/* HEADER ESTANDARIZADO (Igual a Proyectos) */}
            <section className="bg-atlas-900 text-white py-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                        Catálogo de <span className="text-atlas-300">Hardware & Software</span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Equipamiento profesional probado por nuestros ingenieros. Si nosotros lo usamos en terreno, te lo recomendamos.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 py-10">

                {/* BARRA DE CONTROLES RESPONSIVE */}
                <div className="flex flex-col lg:flex-row justify-between gap-6 mb-10 sticky top-24 z-30 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-100 transition-all">

                    {/* Categorías (Scroll horizontal en móvil) */}
                    <div className="flex overflow-x-auto gap-2 pb-2 lg:pb-0 hide-scrollbar items-center">
                        <Filter size={20} className="text-atlas-500 mr-2 flex-shrink-0" />
                        {CATEGORIAS.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFiltroCategoria(cat)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${filtroCategoria === cat
                                        ? 'bg-atlas-900 text-white shadow-md'
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-atlas-900'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Selector de Orden */}
                        <div className="relative min-w-[180px]">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <ArrowUpDown size={16} className="text-gray-400" />
                            </div>
                            <select
                                value={orden}
                                onChange={(e) => setOrden(e.target.value)}
                                className="appearance-none w-full pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atlas-300 focus:border-transparent cursor-pointer text-gray-700 font-medium"
                            >
                                <option value="relevantes">Más Relevantes</option>
                                <option value="menor_mayor">Precio: Menor a Mayor</option>
                                <option value="mayor_menor">Precio: Mayor a Menor</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Buscador */}
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar producto..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-atlas-300 focus:border-transparent outline-none text-sm transition-shadow"
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* GRID DE PRODUCTOS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {productosProcesados.length > 0 ? (
                        productosProcesados.map((producto) => (
                            <ProductCard key={producto.id} producto={producto} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Box size={40} className="opacity-40 text-atlas-900" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No encontramos resultados</h3>
                            <p className="text-sm">Intenta con otra categoría o término de búsqueda.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

// COMPONENTE TARJETA DE PRODUCTO
const ProductCard = ({ producto }) => {
    const sinStock = producto.stock === 0;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full relative">

            {/* Badge de Destacado (Solo si es relevante y tiene stock) */}
            {producto.destacado && !sinStock && (
                <div className="absolute top-3 left-3 z-10 bg-atlas-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wider">
                    Recomendado
                </div>
            )}

            {/* Imagen */}
            <div className="relative h-56 overflow-hidden bg-gray-50 group">
                <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${sinStock ? 'opacity-60 grayscale' : ''}`}
                />

                {/* Overlay Agotado */}
                {sinStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
                        <span className="text-red-600 font-bold border-2 border-red-600 px-4 py-1 rounded uppercase tracking-widest text-sm rotate-[-12deg]">
                            Agotado
                        </span>
                    </div>
                )}

                {/* Botón Acción Rápida (Hover en Desktop) */}
                {!sinStock && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden lg:block">
                        <button className="w-full bg-atlas-900 text-white font-bold py-2 rounded-lg shadow-lg hover:bg-atlas-700 flex items-center justify-center gap-2">
                            <ShoppingCart size={18} /> Agregar al Carrito
                        </button>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-atlas-300 uppercase tracking-wide bg-atlas-50 px-2 py-1 rounded">{producto.categoria}</span>
                    <span className={`text-xs font-medium ${sinStock ? 'text-red-500' : 'text-gray-500'}`}>
                        {sinStock ? 'Sin Stock' : `${producto.stock} unid.`}
                    </span>
                </div>

                <h3 className="font-bold text-gray-900 text-lg mb-2 leading-tight group-hover:text-atlas-500 transition-colors cursor-pointer">
                    {producto.nombre}
                </h3>

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-medium">Precio Lista</span>
                        <span className="text-2xl font-bold text-atlas-900">
                            ${producto.precio.toLocaleString('es-CL')}
                        </span>
                    </div>

                    {/* Botón Móvil (Siempre visible) */}
                    <button
                        disabled={sinStock}
                        className={`lg:hidden p-3 rounded-full shadow-sm transition-colors ${sinStock
                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                : 'bg-atlas-900 text-white active:scale-95'
                            }`}
                    >
                        <ShoppingCart size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Catalogo;