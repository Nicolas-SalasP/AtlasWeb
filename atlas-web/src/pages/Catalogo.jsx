import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Filter, Box, ChevronDown, ArrowUpDown, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../api/axiosConfig';

const CATEGORIAS = ["Todos", "Seguridad", "Redes", "Infraestructura", "Software"];

const Catalogo = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroCategoria, setFiltroCategoria] = useState("Todos");
    const [busqueda, setBusqueda] = useState("");
    const [orden, setOrden] = useState("relevantes");

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const response = await api.get('/products');
                setProductos(response.data);
            } catch (error) {
                console.error("Error cargando productos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProductos();
    }, []);

    const productosProcesados = productos
        .filter(producto => {
            // CORRECCIÓN CATEGORÍA: Ahora verificamos el nombre dentro del objeto category
            const nombreCategoria = producto.category?.name || "Sin Categoría";
            const coincideCategoria = filtroCategoria === "Todos" || nombreCategoria === filtroCategoria;

            const coincideBusqueda = producto.name.toLowerCase().includes(busqueda.toLowerCase()) ||
                producto.sku?.toLowerCase().includes(busqueda.toLowerCase());

            return coincideCategoria && coincideBusqueda;
        })
        .sort((a, b) => {
            const precioA = parseInt(a.price);
            const precioB = parseInt(b.price);
            if (orden === "menor_mayor") return precioA - precioB;
            if (orden === "mayor_menor") return precioB - precioA;
            if (orden === "relevantes") return (b.stock_current > 0) - (a.stock_current > 0);
            return 0;
        });

    if (loading) return <div className="h-screen flex items-center justify-center gap-2 text-atlas-900"><Loader2 className="animate-spin" /> Cargando Catálogo...</div>;

    return (
        <div className="bg-white min-h-screen pt-20">
            <section className="bg-atlas-900 text-white py-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                        Catálogo de <span className="text-atlas-300">Hardware & Software</span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Equipamiento profesional probado por nuestros ingenieros.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="flex flex-col lg:flex-row justify-between gap-6 mb-10 sticky top-24 z-30 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-100 transition-all">
                    <div className="flex overflow-x-auto gap-2 pb-2 lg:pb-0 hide-scrollbar items-center">
                        <Filter size={20} className="text-atlas-500 mr-2 flex-shrink-0" />
                        {CATEGORIAS.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFiltroCategoria(cat)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${filtroCategoria === cat ? 'bg-atlas-900 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-atlas-900'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative min-w-[180px]">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <ArrowUpDown size={16} className="text-gray-400" />
                            </div>
                            <select
                                value={orden}
                                onChange={(e) => setOrden(e.target.value)}
                                className="appearance-none w-full pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atlas-300 outline-none cursor-pointer text-gray-700 font-medium"
                            >
                                <option value="relevantes">Más Relevantes</option>
                                <option value="menor_mayor">Precio: Menor a Mayor</option>
                                <option value="mayor_menor">Precio: Mayor a Menor</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>

                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-atlas-300 outline-none text-sm"
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

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

const ProductCard = ({ producto }) => {
    const sinStock = producto.stock_current <= 0;
    const { addToCart } = useCart();
    const BASE_URL = 'http://127.0.0.1:8000';

    const getImagen = () => {
        if (!producto.images || producto.images.length === 0) {
            return "https://placehold.co/400x300?text=No+Image";
        }
        const cover = producto.images.find(img => img.is_cover == 1) || producto.images[0];
        return `${BASE_URL}${cover.url}`;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full relative">
            <div className="relative h-56 overflow-hidden bg-white group flex items-center justify-center p-4">
                <img
                    src={getImagen()}
                    alt={producto.name}
                    className={`w-full h-full object-contain transition-transform duration-700 group-hover:scale-105 ${sinStock ? 'opacity-60 grayscale' : ''}`}
                />

                {sinStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
                        <span className="text-red-600 font-bold border-2 border-red-600 px-4 py-1 rounded uppercase tracking-widest text-sm rotate-[-12deg]">
                            Agotado
                        </span>
                    </div>
                )}

                {!sinStock && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/90 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden lg:block text-center">
                        <button
                            onClick={() => addToCart(producto)}
                            className="w-full bg-atlas-900 text-white font-bold py-2 rounded-lg shadow-lg hover:bg-atlas-700 flex items-center justify-center gap-2"
                        >
                            <ShoppingCart size={18} /> Agregar
                        </button>
                    </div>
                )}
            </div>

            <div className="p-5 flex flex-col flex-grow border-t border-gray-50">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-atlas-300 uppercase tracking-wide bg-atlas-50 px-2 py-1 rounded">
                        {producto.category?.name || 'Hardware'}
                    </span>
                    <span className={`text-xs font-medium ${sinStock ? 'text-red-500' : 'text-gray-500'}`}>
                        {sinStock ? 'Sin Stock' : `${producto.stock_current} unid.`}
                    </span>
                </div>

                <h3 className="font-bold text-gray-900 text-lg mb-2 leading-tight group-hover:text-atlas-500 transition-colors cursor-pointer">
                    {producto.name}
                </h3>

                <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-medium">Precio Lista</span>
                        <span className="text-2xl font-bold text-atlas-900">
                            ${parseInt(producto.price).toLocaleString('es-CL')}
                        </span>
                    </div>
                    <button
                        disabled={sinStock}
                        onClick={() => addToCart(producto)}
                        className={`lg:hidden p-3 rounded-full shadow-sm transition-colors ${sinStock ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-atlas-900 text-white active:scale-95'}`}
                    >
                        <ShoppingCart size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Catalogo;