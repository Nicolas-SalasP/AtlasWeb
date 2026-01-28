import React, { useState, useRef } from 'react';
import {
    Plus, Search, Edit, Trash2, X,
    Image as ImageIcon, Save, Upload
} from 'lucide-react';
import AlertModal from '../../components/AlertModal';

// Mock Data Inicial adaptada para soportar arreglos de imágenes
const INITIAL_PRODUCTS = [
    {
        id: 1,
        nombre: "Kit 4 Cámaras Hilook",
        categoria: "Seguridad",
        precio: 149990,
        stock: 5,
        imagenes: ["https://images.unsplash.com/photo-1557324232-b8917d3c3d63?auto=format&fit=crop&q=80&w=400&h=300"]
    },
    {
        id: 2,
        nombre: "Router MikroTik hAP",
        categoria: "Redes",
        precio: 65990,
        stock: 12,
        imagenes: ["https://images.unsplash.com/photo-1544197150-b99a580bbcbf?auto=format&fit=crop&q=80&w=400&h=300"]
    },
    {
        id: 3,
        nombre: "Switch PoE 8 Puertos",
        categoria: "Redes",
        precio: 45000,
        stock: 2,
        imagenes: ["https://images.unsplash.com/photo-1517430816045-df4b7de8db69?auto=format&fit=crop&q=80&w=400&h=300"]
    },
];

const AdminProductos = () => {
    const [productos, setProductos] = useState(INITIAL_PRODUCTS);
    const [filtro, setFiltro] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [productoEditando, setProductoEditando] = useState(null);
    const fileInputRef = useRef(null);

    // Estado del Formulario (Cambiamos 'imagen' por 'imagenes' como array)
    const [form, setForm] = useState({
        nombre: '',
        categoria: 'Seguridad',
        precio: '',
        stock: '',
        imagenes: []
    });

    const abrirModal = (producto = null) => {
        if (producto) {
            setProductoEditando(producto);
            setForm(producto);
        } else {
            setProductoEditando(null);
            setForm({ nombre: '', categoria: 'Seguridad', precio: '', stock: '', imagenes: [] });
        }
        setModalOpen(true);
    };

    // Lógica para procesar subida de archivos locales
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        files.forEach(file => {
            if (!file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onloadend = () => {
                setForm(prev => ({
                    ...prev,
                    imagenes: [...prev.imagenes, reader.result]
                }));
            };
            reader.readAsDataURL(file);
        });
    };

    const eliminarImagenDeGaleria = (index) => {
        setForm({
            ...form,
            imagenes: form.imagenes.filter((_, i) => i !== index)
        });
    };

    const handleGuardar = (e) => {
        e.preventDefault();

        if (productoEditando) {
            setProductos(productos.map(p => p.id === productoEditando.id ? { ...form, id: p.id } : p));
        } else {
            setProductos([...productos, { ...form, id: Date.now() }]);
        }
        setModalOpen(false);
    };

    const eliminarProducto = (id) => {
        if (window.confirm("¿Seguro que deseas eliminar este producto?")) {
            setProductos(productos.filter(p => p.id !== id));
        }
    };

    const productosFiltrados = productos.filter(p => p.nombre.toLowerCase().includes(filtro.toLowerCase()));

    return (
        <div className="space-y-6 animate-in fade-in duration-700">

            {/* Header Página */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Inventario de Productos</h1>
                    <p className="text-gray-500">Administra el catálogo de la tienda de forma segura</p>
                </div>
                <button
                    onClick={() => abrirModal()}
                    className="bg-atlas-900 hover:bg-atlas-800 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg transition-all active:scale-95"
                >
                    <Plus size={20} /> Nuevo Producto
                </button>
            </div>

            {/* Barra de Búsqueda */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                <Search className="text-gray-400" size={22} />
                <input
                    type="text"
                    placeholder="Buscar producto por nombre..."
                    className="w-full outline-none text-gray-700 font-medium"
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                />
            </div>

            {/* Tabla de Productos */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-widest font-bold">
                                <th className="p-6">Producto</th>
                                <th className="p-6">Categoría</th>
                                <th className="p-6">Precio</th>
                                <th className="p-6">Stock</th>
                                <th className="p-6 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {productosFiltrados.map((prod) => (
                                <tr key={prod.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="p-6 flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                                            {/* Mostramos la primera imagen del array */}
                                            {prod.imagenes && prod.imagenes.length > 0 ? (
                                                <img src={prod.imagenes[0]} className="w-full h-full object-cover" alt={prod.nombre} />
                                            ) : (
                                                <ImageIcon className="m-auto mt-4 text-gray-300" />
                                            )}
                                        </div>
                                        <span className="font-bold text-gray-800 text-base">{prod.nombre}</span>
                                    </td>
                                    <td className="p-6">
                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold uppercase tracking-wider">{prod.categoria}</span>
                                    </td>
                                    <td className="p-6 font-bold text-gray-900">${prod.precio.toLocaleString('es-CL')}</td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-xl text-xs font-bold ${prod.stock < 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                            {prod.stock} unid.
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => abrirModal(prod)} className="p-2 text-gray-400 hover:text-atlas-500 hover:bg-atlas-50 rounded-xl transition-all"><Edit size={20} /></button>
                                            <button onClick={() => eliminarProducto(prod.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {productosFiltrados.length === 0 && (
                        <div className="p-20 text-center text-gray-400 font-medium">No se encontraron productos en el inventario.</div>
                    )}
                </div>
            </div>

            {/* MODAL CREAR/EDITAR REDISEÑADO */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">

                        {/* Modal Header */}
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{productoEditando ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                                <p className="text-sm text-gray-500">Completa la información técnica del item</p>
                            </div>
                            <button onClick={() => setModalOpen(false)} className="p-3 hover:bg-gray-200 rounded-full transition-colors text-gray-400"><X size={24} /></button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <form onSubmit={handleGuardar} className="p-8 overflow-y-auto space-y-6 custom-scrollbar">

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Nombre del Producto</label>
                                    <input type="text" required className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-atlas-300 outline-none transition-all font-medium"
                                        placeholder="Ej: Cámara IP Domo 4MP"
                                        value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Categoría</label>
                                    <select className="w-full px-4 py-3 border border-gray-200 rounded-2xl outline-none bg-white font-medium"
                                        value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                                        <option>Seguridad</option>
                                        <option>Redes</option>
                                        <option>Infraestructura</option>
                                        <option>Software</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Stock Disponible</label>
                                    <input type="number" required className="w-full px-4 py-3 border border-gray-200 rounded-2xl outline-none font-medium"
                                        value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Precio de Venta ($)</label>
                                    <input type="number" required className="w-full px-4 py-3 border border-gray-200 rounded-2xl outline-none font-bold text-atlas-900 text-lg"
                                        value={form.precio} onChange={e => setForm({ ...form, precio: Number(e.target.value) })} />
                                </div>
                            </div>

                            {/* SECCIÓN DE IMÁGENES LOCALES */}
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-gray-700">Galería de Imágenes</label>

                                {/* Dropzone simulado */}
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className="border-2 border-dashed border-gray-200 rounded-[2rem] p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer group"
                                >
                                    <Upload className="text-gray-300 group-hover:text-blue-500 transition-colors mb-3" size={40} />
                                    <p className="text-sm font-bold text-gray-600">Subir imágenes desde el equipo</p>
                                    <p className="text-xs text-gray-400 mt-1">Formatos permitidos: PNG, JPG, WebP</p>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                    />
                                </div>

                                {/* Previsualización de Galería */}
                                {form.imagenes.length > 0 && (
                                    <div className="grid grid-cols-4 gap-4 mt-4 p-2">
                                        {form.imagenes.map((img, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-[1.2rem] overflow-hidden border border-gray-100 group shadow-sm">
                                                <img src={img} className="w-full h-full object-cover" alt="preview" />
                                                <button
                                                    type="button"
                                                    onClick={() => eliminarImagenDeGaleria(idx)}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md hover:scale-110"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer del Formulario */}
                            <div className="pt-6 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-100 rounded-2xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-atlas-900 text-white font-bold rounded-2xl shadow-xl hover:shadow-atlas-900/30 active:scale-95 transition-all flex justify-center items-center gap-2"
                                >
                                    <Save size={20} /> Guardar Producto
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminProductos;