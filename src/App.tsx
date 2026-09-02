import React, { useState, useMemo, useEffect } from "react";

// ==========================================
// 1. DEFINICIÓN DE TIPOS
// ==========================================
interface Usuario {
  Usuario: string;
  Contraseña: string;
  "Nombre del Talento PC PUMA": string;
  "Área o departamento": string;
  "Perfil de usuario": string;
}

interface RegistroCurso {
  id_principal: string | number;
  "Nombre del colaborador": string;
  "Área o Departamento a quien reporta": string;
  Puesto: string;
  "Perfil de usuario": string;
  "Habilidades a desarrollar": string;
  "Nombre del curso": string;
  "Orden de ruta": string | number;
  Modalidad: string;
  "Proveedor del curso": string;
  Costo: string | number;
  "Fecha de pago del curso": string;
  "Fecha de inicio": string;
  "Fecha de conclusión": string;
  "Horas totales del curso": string | number;
  Estatus: string;
  "Evidencia de conclusión": string;
}

const API_URL =
  "https://script.google.com/macros/s/AKfycbzNnHwYVt_7cDl4UcpgVHkRDnMUJyYn5k1ve3ChYqqhNfkbQTYvoXp-MUyA1ec0PzqNew/exec";

// ==========================================
// COMPONENTE: FOOTER INSTITUCIONAL
// ==========================================
const FooterInstitucional = () => (
  <footer className="bg-[#012B5C] border-t-4 border-[#D4AF37] py-6 w-full print:hidden">
    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
      <img src="/unamlogo.png" alt="UNAM Nuestra gran Universidad" className="h-16 w-auto object-contain" />
      <div className="text-center space-y-1">
        <p className="text-[11px] md:text-xs text-gray-200 font-light">
          Hecho en México. Universidad Nacional Autónoma de México (UNAM). Todos los derechos reservados 2026.
        </p>
        <p className="text-xs md:text-sm font-bold text-white tracking-wide">
          COORDINACIÓN DE PROYECTOS TECNOLÓGICOS Y DE INNOVACIÓN
        </p>
        <p className="text-xs md:text-sm font-bold text-[#D4AF37]">
          © 2026 PC Puma - UNAM
        </p>
      </div>
      <img src="/logo475.png" alt="475+ Universidad de México" className="h-16 w-auto object-contain" />
    </div>
  </footer>
);

export default function App() {
  // ==========================================
  // 2. ESTADOS GENERALES
  // ==========================================
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");

  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [todosLosUsuarios, setTodosLosUsuarios] = useState<Usuario[]>([]);
  const [todosLosCursos, setTodosLosCursos] = useState<RegistroCurso[]>([]);
  
  const [catPuestos, setCatPuestos] = useState<any[]>([]);
  const [catCursos, setCatCursos] = useState<any[]>([]);
  const [catProveedores, setCatProveedores] = useState<any[]>([]);
  const [catModalidades, setCatModalidades] = useState<any[]>([]);
  const [catEstatus, setCatEstatus] = useState<any[]>([]);
  
  const [colaboradorSeleccionado, setColaboradorSeleccionado] = useState<string>("");
  const [filtroArea, setFiltroArea] = useState<string>("");
  
  const [vistaActiva, setVistaActiva] = useState<"Ficha" | "Admin">("Ficha");
  const [subVistaAdmin, setSubVistaAdmin] = useState<"Menu" | "CrearUsuario" | "AsignarCurso" | "ListaUsuarios" | "ListaCursosAsignados">("Menu");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para Modales de Edición
  const [cursoAEditar, setCursoAEditar] = useState<RegistroCurso | null>(null); 
  const [datosEdicion, setDatosEdicion] = useState({ Estatus: "Concluido", "Fecha de conclusión": "", "Evidencia de conclusión": "" });

  const [usuarioModificar, setUsuarioModificar] = useState<Usuario | null>(null); 
  const [cursoAsignadoModificar, setCursoAsignadoModificar] = useState<RegistroCurso | null>(null); 

  const [nuevoUsuario, setNuevoUsuario] = useState<Usuario>({
    Usuario: "", Contraseña: "", "Nombre del Talento PC PUMA": "", "Área o departamento": "", "Perfil de usuario": "Colaborador"
  });

  const [nuevoCurso, setNuevoCurso] = useState<Partial<RegistroCurso>>({
    "Nombre del colaborador": "", "Área o Departamento a quien reporta": "", Puesto: "", "Perfil de usuario": "", "Habilidades a desarrollar": "Habilidades transversales",
    "Nombre del curso": "", "Orden de ruta": "1", Modalidad: "", "Proveedor del curso": "", Costo: "0", "Fecha de pago del curso": "NA",
    "Fecha de inicio": "", "Fecha de conclusión": "NA", "Horas totales del curso": "0", Estatus: "", "Evidencia de conclusión": "NA"
  });

  // ==========================================
  // 3. INGRESO Y RECARGA DE DATOS
  // ==========================================
  const cargarDatos = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTodosLosUsuarios(data.usuarios || []);
      setTodosLosCursos(data.principal || []);
      setCatPuestos(data.catPuestos || []);
      setCatCursos(data.catCursos || []);
      setCatProveedores(data.catProveedores || []);
      setCatModalidades(data.catModalidades || []);
      setCatEstatus(data.catEstatus || []);
      return data;
    } catch (error) {
      console.error("Error obteniendo datos:", error);
      return null;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return setErrorMensaje("Ingresa usuario y contraseña.");
    setIsLoading(true); setErrorMensaje("");

    const data = await cargarDatos();
    if (data) {
      const usuarioEncontrado = data.usuarios.find((u: Usuario) => u.Usuario === username && u.Contraseña === password);
      if (usuarioEncontrado) {
        setUsuarioActual(usuarioEncontrado);
        setColaboradorSeleccionado(usuarioEncontrado["Nombre del Talento PC PUMA"]);
        setIsLoggedIn(true);
      } else setErrorMensaje("Credenciales incorrectas.");
    } else setErrorMensaje("Error de conexión.");
    setIsLoading(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false); setUsuarioActual(null); setUsername(""); setPassword(""); setVistaActiva("Ficha"); setSubVistaAdmin("Menu");
  };

  const handlePrint = () => window.print();

  // ==========================================
  // 4. LÓGICA DE ESCRITURA (CRUD COMPLETO POST)
  // ==========================================
  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      await fetch(API_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "create", sheetName: "tb_usuarios", record: nuevoUsuario }) });
      await cargarDatos();
      alert("¡Usuario creado exitosamente!");
      setSubVistaAdmin("ListaUsuarios");
    } catch (error) { alert("Error al crear usuario."); } finally { setIsSubmitting(false); }
  };

  const handleActualizarUsuarioAdmin = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      await fetch(API_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "update", sheetName: "tb_usuarios", idColumnName: "Usuario", idValue: usuarioModificar?.Usuario, record: usuarioModificar }) });
      await cargarDatos();
      alert("¡Usuario actualizado exitosamente!");
      setUsuarioModificar(null);
    } catch (error) { alert("Error al actualizar usuario."); } finally { setIsSubmitting(false); }
  };

  const handleEliminarUsuarioAdmin = async (usuarioID: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.")) return;
    setIsSubmitting(true);
    try {
      await fetch(API_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "delete", sheetName: "tb_usuarios", idColumnName: "Usuario", idValue: usuarioID }) });
      await cargarDatos();
      alert("¡Usuario eliminado!");
    } catch (error) { alert("Error al eliminar usuario."); } finally { setIsSubmitting(false); }
  };

  const handleSeleccionColaboradorCurso = (nombre: string) => {
    const empleado = todosLosUsuarios.find(u => u["Nombre del Talento PC PUMA"] === nombre);
    setNuevoCurso({ ...nuevoCurso, "Nombre del colaborador": nombre, "Área o Departamento a quien reporta": empleado ? empleado["Área o departamento"] : "", "Perfil de usuario": empleado ? empleado["Perfil de usuario"] : "" });
  };

  const handleCrearCurso = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      const idUnico = Date.now().toString();
      await fetch(API_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "create", sheetName: "tb_principal", record: { ...nuevoCurso, id_principal: idUnico } }) });
      await cargarDatos();
      alert("¡Capacitación asignada correctamente!");
      setSubVistaAdmin("ListaCursosAsignados");
    } catch (error) { alert("Error al asignar el curso."); } finally { setIsSubmitting(false); }
  };

  const handleActualizarCursoAsignadoAdmin = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      await fetch(API_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "update", sheetName: "tb_principal", idColumnName: "id_principal", idValue: cursoAsignadoModificar?.id_principal, record: cursoAsignadoModificar }) });
      await cargarDatos();
      alert("¡Capacitación actualizada exitosamente!");
      setCursoAsignadoModificar(null);
    } catch (error) { alert("Error al actualizar curso."); } finally { setIsSubmitting(false); }
  };

  const handleEliminarCursoAsignadoAdmin = async (cursoID: string | number) => {
    if (!window.confirm("¿Estás seguro de que deseas borrar este curso asignado?")) return;
    setIsSubmitting(true);
    try {
      await fetch(API_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "delete", sheetName: "tb_principal", idColumnName: "id_principal", idValue: cursoID }) });
      await cargarDatos();
      alert("¡Curso asignado eliminado!");
    } catch (error) { alert("Error al eliminar curso."); } finally { setIsSubmitting(false); }
  };

  const handleConcluirCurso = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      await fetch(API_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "update", sheetName: "tb_principal", idColumnName: "id_principal", idValue: cursoAEditar?.id_principal, record: { Estatus: datosEdicion.Estatus, "Fecha de conclusión": datosEdicion["Fecha de conclusión"], "Evidencia de conclusión": datosEdicion["Evidencia de conclusión"] } }) });
      await cargarDatos();
      alert("¡El curso ha sido actualizado correctamente!");
      setCursoAEditar(null);
    } catch (error) { alert("Hubo un error al actualizar el curso."); } finally { setIsSubmitting(false); }
  };

  // ==========================================
  // 5. LÓGICA DE ROLES Y FILTRADO
  // ==========================================
  const esAdmin = usuarioActual?.["Perfil de usuario"]?.includes("Administrador");
  const esCoordinador = usuarioActual?.["Perfil de usuario"]?.includes("Coordinador");
  const esSupervisor = usuarioActual?.["Perfil de usuario"]?.includes("Supervisor");
  const tienePrivilegios = esAdmin || esCoordinador;

  const colaboradoresDisponibles = useMemo(() => {
    let filtrados = todosLosUsuarios.filter((u) => {
      if (esAdmin || esCoordinador) return true;
      if (esSupervisor) return u["Área o departamento"]?.trim() === usuarioActual?.["Área o departamento"]?.trim();
      return u["Nombre del Talento PC PUMA"]?.trim() === usuarioActual?.["Nombre del Talento PC PUMA"]?.trim();
    });
    
    if (filtroArea) {
      filtrados = filtrados.filter(u => u["Área o departamento"]?.trim() === filtroArea.trim());
    }
    
    return filtrados;
  }, [todosLosUsuarios, esAdmin, esCoordinador, esSupervisor, usuarioActual, filtroArea]);

  useEffect(() => {
    if (colaboradoresDisponibles.length > 0) {
      if (colaboradorSeleccionado === "TODOS") return;
      const actualSigueDisponible = colaboradoresDisponibles.find(
        (c) => c["Nombre del Talento PC PUMA"]?.trim() === colaboradorSeleccionado?.trim()
      );
      if (!actualSigueDisponible) {
        setColaboradorSeleccionado(colaboradoresDisponibles[0]["Nombre del Talento PC PUMA"]);
      }
    } else {
      setColaboradorSeleccionado(""); 
    }
  }, [colaboradoresDisponibles, colaboradorSeleccionado]);

  const pagosProximos = todosLosCursos.filter(c => c["Fecha de pago del curso"] && c["Fecha de pago del curso"] !== "NA" && c.Estatus?.trim() !== "Concluido");

  // ==========================================
  // 6. FUNCIÓN DIBUJADORA DE FICHAS (REUTILIZABLE)
  // ==========================================
  const renderFichaColaborador = (nombre: string) => {
    const nombreLimpio = nombre?.trim();
    const cursosDelColaborador = todosLosCursos.filter(c => c["Nombre del colaborador"]?.trim() === nombreLimpio);
    const cursosConcluidos = cursosDelColaborador.filter((c) => c.Estatus?.trim() === "Concluido");
    const cursosEnCurso = cursosDelColaborador.filter((c) => c.Estatus?.trim() === "En curso");
    const cursosNoIniciados = cursosDelColaborador.filter((c) => c.Estatus?.trim() === "No iniciado" || !c.Estatus || c.Estatus?.trim() === "");
    const porcentajeAvance = cursosDelColaborador.length > 0 ? Math.round((cursosConcluidos.length / cursosDelColaborador.length) * 100) : 0;
    
    const usuarioInfo = todosLosUsuarios.find(u => u["Nombre del Talento PC PUMA"]?.trim() === nombreLimpio);
    const datosGenerales = { 
      Puesto: cursosDelColaborador.length > 0 ? cursosDelColaborador[0].Puesto : "No especificado", 
      "Área o Departamento a quien reporta": usuarioInfo?.["Área o departamento"] || "No especificada" 
    };

    return (
      <div key={nombreLimpio} className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-8 print:shadow-none print:border-none print:m-0 print:p-0 print:break-after-page">
        <div className="border-b-2 border-[#D4AF37] pb-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Ficha de Avance</span>
            <h2 className="text-3xl font-extrabold text-[#012B5C] mt-1">{nombreLimpio}</h2>
            <div className="mt-2 text-sm text-gray-600 space-y-1">
              <p><strong className="text-gray-800">Puesto:</strong> {datosGenerales.Puesto}</p>
              <p><strong className="text-gray-800">Área:</strong> {datosGenerales["Área o Departamento a quien reporta"]}</p>
            </div>
          </div>
          <div className="text-center bg-gray-50 border border-gray-200 p-4 rounded-xl shadow-inner min-w-[140px] w-full md:w-auto">
            <p className="text-xs font-bold text-gray-500 uppercase">Avance Global</p>
            <p className="text-4xl font-black text-[#012B5C] my-1">{porcentajeAvance}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden"><div className="bg-[#D4AF37] h-2.5 rounded-full" style={{ width: `${porcentajeAvance}%` }}></div></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg text-center"><p className="text-xs font-bold text-emerald-800 uppercase">Concluidos</p><p className="text-2xl font-bold text-emerald-900">{cursosConcluidos.length}</p></div>
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-center"><p className="text-xs font-bold text-amber-800 uppercase">En Curso</p><p className="text-2xl font-bold text-amber-900">{cursosEnCurso.length}</p></div>
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg text-center"><p className="text-xs font-bold text-gray-600 uppercase">Sin Iniciar</p><p className="text-2xl font-bold text-gray-800">{cursosNoIniciados.length}</p></div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-[#012B5C] border-b pb-2 mb-4 flex items-center gap-2">✅ Cursos Concluidos</h3>
            {cursosConcluidos.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No hay cursos concluidos registrados.</p>
            ) : (
              <div className="grid gap-4">
                {cursosConcluidos.map((curso, i) => (
                  <div key={i} className="border p-4 rounded-lg bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="font-bold text-gray-900">{curso["Nombre del curso"]}</h4>
                      <p className="text-xs text-gray-600 mt-1">Inicio: {curso["Fecha de inicio"]} | Fin: {curso["Fecha de conclusión"]}</p>
                      {tienePrivilegios && <p className="text-xs font-bold text-green-700 mt-1">Costo: ${curso.Costo}</p>}
                    </div>
                    {curso["Evidencia de conclusión"] && curso["Evidencia de conclusión"] !== "NA" && (
                      <a href={curso["Evidencia de conclusión"]} target="_blank" rel="noreferrer" className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2 px-4 rounded shadow text-center w-full md:w-auto">Ver Constancia</a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#012B5C] border-b pb-2 mb-4 flex items-center gap-2">⏳ Cursos En Curso</h3>
            {cursosEnCurso.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No hay cursos actualmente en desarrollo.</p>
            ) : (
              <div className="grid gap-4">
                {cursosEnCurso.map((curso, i) => (
                  <div key={i} className="border border-amber-200 p-4 rounded-lg bg-amber-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="font-bold text-gray-900">{curso["Nombre del curso"]}</h4>
                      <p className="text-xs text-gray-600 mt-1">Fecha de Inicio: {curso["Fecha de inicio"]}</p>
                      {tienePrivilegios && <p className="text-xs font-bold text-amber-700 mt-1">Límite de pago: {curso["Fecha de pago del curso"] || "Pendiente"}</p>}
                    </div>
                    {tienePrivilegios && (
                      <button onClick={() => { setCursoAEditar(curso); setDatosEdicion({ Estatus: "Concluido", "Fecha de conclusión": "", "Evidencia de conclusión": "" }); }} className="mt-3 md:mt-0 bg-[#012B5C] text-white text-xs font-bold py-2 px-4 rounded shadow hover:bg-[#011B3A] transition print:hidden w-full md:w-auto">
                        ✅ Concluir / Editar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#012B5C] border-b pb-2 mb-4 flex items-center gap-2">💤 Cursos Sin Iniciar</h3>
            {cursosNoIniciados.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No hay cursos pendientes en la ruta.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cursosNoIniciados.map((curso, i) => (
                  <div key={i} className="border border-gray-200 p-4 rounded-lg bg-white flex justify-between items-center shadow-sm">
                    <div>
                      <span className="text-xs font-bold text-gray-500">Orden #{curso["Orden de ruta"]}</span>
                      <h4 className="font-semibold text-gray-800 text-sm mt-1">{curso["Nombre del curso"]}</h4>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded">Pendiente</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // 7. RENDERIZADO DEL DASHBOARD GLOBAL
  // ==========================================
  if (isLoggedIn && usuarioActual) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
        
        {/* MODAL 1: CONCLUIR CURSO (Ficha) */}
        {cursoAEditar && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 print:hidden">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border-t-4 border-[#D4AF37]">
              <h3 className="text-2xl font-extrabold text-[#012B5C] mb-2">Concluir Capacitación</h3>
              <p className="text-sm text-gray-600 mb-6">Colaborador: <span className="font-bold">{cursoAEditar["Nombre del colaborador"]}</span><br/>Curso: <span className="font-bold text-[#012B5C]">{cursoAEditar["Nombre del curso"]}</span></p>
              <form onSubmit={handleConcluirCurso} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Cambiar Estatus</label>
                  <select required value={datosEdicion.Estatus} onChange={(e) => setDatosEdicion({...datosEdicion, Estatus: e.target.value})} className="w-full border rounded p-2 outline-none focus:ring-[#D4AF37]">
                    {catEstatus.map((est, i) => <option key={i} value={est["Estatus del curso"]}>{est["Estatus del curso"]}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Fecha de Conclusión</label><input required type="text" placeholder="DD/MM/AAAA" value={datosEdicion["Fecha de conclusión"]} onChange={(e) => setDatosEdicion({...datosEdicion, "Fecha de conclusión": e.target.value})} className="w-full border rounded p-2 outline-none focus:ring-[#D4AF37]" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Enlace a Constancia (Drive/PDF)</label><input required type="url" placeholder="https://drive.google.com/..." value={datosEdicion["Evidencia de conclusión"]} onChange={(e) => setDatosEdicion({...datosEdicion, "Evidencia de conclusión": e.target.value})} className="w-full border rounded p-2 outline-none focus:ring-[#D4AF37]" /></div>
                <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setCursoAEditar(null)} className="text-gray-500 hover:text-gray-700 font-bold px-4 py-2 transition">Cancelar</button><button type="submit" disabled={isSubmitting} className={`font-bold py-2 px-6 rounded shadow transition ${isSubmitting ? "bg-gray-400 text-gray-700" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}>{isSubmitting ? "Guardando..." : "Guardar Cambios"}</button></div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: EDITAR USUARIO (Admin) */}
        {usuarioModificar && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 print:hidden">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border-t-4 border-[#012B5C]">
              <h3 className="text-2xl font-extrabold text-[#012B5C] mb-4">Editar Usuario</h3>
              <form onSubmit={handleActualizarUsuarioAdmin} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo</label><input required type="text" value={usuarioModificar["Nombre del Talento PC PUMA"]} onChange={(e) => setUsuarioModificar({...usuarioModificar, "Nombre del Talento PC PUMA": e.target.value})} className="w-full border rounded p-2 outline-none focus:ring-[#D4AF37]" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Área o Depto</label><input required type="text" value={usuarioModificar["Área o departamento"]} onChange={(e) => setUsuarioModificar({...usuarioModificar, "Área o departamento": e.target.value})} className="w-full border rounded p-2 outline-none focus:ring-[#D4AF37]" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Contraseña</label><input required type="text" value={usuarioModificar.Contraseña} onChange={(e) => setUsuarioModificar({...usuarioModificar, Contraseña: e.target.value})} className="w-full border rounded p-2 outline-none focus:ring-[#D4AF37]" /></div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Perfil</label>
                    <select required value={usuarioModificar["Perfil de usuario"]} onChange={(e) => setUsuarioModificar({...usuarioModificar, "Perfil de usuario": e.target.value})} className="w-full border rounded p-2 outline-none focus:ring-[#D4AF37]">
                      <option value="Colaborador">Colaborador</option><option value="Supervisor">Supervisor</option><option value="Coordinador">Coordinador</option><option value="Administrador">Administrador</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setUsuarioModificar(null)} className="text-gray-500 hover:text-gray-700 font-bold px-4 py-2 transition">Cancelar</button><button type="submit" disabled={isSubmitting} className={`font-bold py-2 px-6 rounded shadow transition ${isSubmitting ? "bg-gray-400 text-gray-700" : "bg-[#012B5C] hover:bg-[#011B3A] text-white"}`}>{isSubmitting ? "Actualizando..." : "Actualizar Usuario"}</button></div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: EDITAR CURSO ASIGNADO (Admin) */}
        {cursoAsignadoModificar && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 print:hidden overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 border-t-4 border-[#012B5C] my-8">
              <h3 className="text-2xl font-extrabold text-[#012B5C] mb-4">Editar Capacitación Asignada</h3>
              <form onSubmit={handleActualizarCursoAsignadoAdmin} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Curso</label><select required value={cursoAsignadoModificar["Nombre del curso"]} onChange={(e) => setCursoAsignadoModificar({...cursoAsignadoModificar, "Nombre del curso": e.target.value})} className="w-full border rounded p-2 outline-none focus:ring-[#D4AF37]">{catCursos.map((c, i) => <option key={i} value={c["Nombre de curso"]}>{c["Nombre de curso"]}</option>)}</select></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Estatus</label><select required value={cursoAsignadoModificar.Estatus} onChange={(e) => setCursoAsignadoModificar({...cursoAsignadoModificar, Estatus: e.target.value})} className="w-full border rounded p-2 outline-none focus:ring-[#D4AF37]">{catEstatus.map((est, i) => <option key={i} value={est["Estatus del curso"]}>{est["Estatus del curso"]}</option>)}</select></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Costo ($)</label><input required type="number" value={cursoAsignadoModificar.Costo} onChange={(e) => setCursoAsignadoModificar({...cursoAsignadoModificar, Costo: e.target.value})} className="w-full border rounded p-2 outline-none focus:ring-[#D4AF37]" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Fecha de Inicio</label><input type="text" value={cursoAsignadoModificar["Fecha de inicio"]} onChange={(e) => setCursoAsignadoModificar({...cursoAsignadoModificar, "Fecha de inicio": e.target.value})} className="w-full border rounded p-2 outline-none focus:ring-[#D4AF37]" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Fecha Límite Pago</label><input type="text" value={cursoAsignadoModificar["Fecha de pago del curso"]} onChange={(e) => setCursoAsignadoModificar({...cursoAsignadoModificar, "Fecha de pago del curso": e.target.value})} className="w-full border rounded p-2 outline-none focus:ring-[#D4AF37]" /></div>
                </div>
                <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setCursoAsignadoModificar(null)} className="text-gray-500 hover:text-gray-700 font-bold px-4 py-2 transition">Cancelar</button><button type="submit" disabled={isSubmitting} className={`font-bold py-2 px-6 rounded shadow transition ${isSubmitting ? "bg-gray-400 text-gray-700" : "bg-[#012B5C] hover:bg-[#011B3A] text-white"}`}>{isSubmitting ? "Actualizando..." : "Actualizar Capacitación"}</button></div>
              </form>
            </div>
          </div>
        )}

        {/* BARRA DE NAVEGACIÓN SUPERIOR */}
        <header className="bg-[#012B5C] text-white shadow-md print:hidden">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <img src="/logopcpuma.png" alt="Logo PC PUMA" className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-bold tracking-wide">Talento PC PUMA</h1>
                <p className="text-xs text-gray-300">Sistema de Avance de Capacitación</p>
              </div>
            </div>

            {(esAdmin || esCoordinador) && (
              <div className="flex bg-[#011B3A] rounded-lg p-1">
                <button onClick={() => setVistaActiva("Ficha")} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${vistaActiva === "Ficha" ? "bg-[#D4AF37] text-[#012B5C]" : "text-white hover:bg-white/10"}`}>Fichas y Reportes</button>
                {esAdmin && <button onClick={() => { setVistaActiva("Admin"); setSubVistaAdmin("Menu"); }} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${vistaActiva === "Admin" ? "bg-[#D4AF37] text-[#012B5C]" : "text-white hover:bg-white/10"}`}>Panel Admin (CRUD)</button>}
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                <p className="font-semibold text-[#D4AF37]">{usuarioActual["Nombre del Talento PC PUMA"]}</p>
                <p className="text-xs text-gray-300">{usuarioActual["Perfil de usuario"]}</p>
              </div>
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-medium text-sm py-2 px-4 rounded transition shadow">Salir</button>
            </div>
          </div>
        </header>

        {tienePrivilegios && pagosProximos.length > 0 && vistaActiva === "Ficha" && (
          <div className="max-w-7xl mx-auto w-full px-6 mt-4 print:hidden">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm flex items-center justify-between">
              <div>
                <p className="font-bold">¡Aviso de Pagos Próximos!</p>
                <p className="text-sm">Hay {pagosProximos.length} curso(s) pendientes de liquidación.</p>
              </div>
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto w-full p-6 flex-grow">
          
          {/* ===================== VISTA FICHA Y REPORTES ===================== */}
          {vistaActiva === "Ficha" && (
            <>
              {/* FILTROS AVANZADOS */}
              <div className="bg-white p-4 rounded-xl shadow-md mb-6 space-y-4 print:hidden">
                <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                  <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {tienePrivilegios && (
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Filtrar por Área / Depto</label>
                        <select value={filtroArea} onChange={(e) => setFiltroArea(e.target.value)} className="w-full border rounded p-2 text-sm focus:ring-[#D4AF37] outline-none">
                          <option value="">Todas las áreas</option>
                          {Array.from(new Set(todosLosUsuarios.map(u => u["Área o departamento"]?.trim()).filter(Boolean))).map((area, i) => <option key={i} value={area}>{area}</option>)}
                        </select>
                      </div>
                    )}
                    {(esSupervisor || tienePrivilegios) ? (
                      <div>
                        <label className="block text-xs font-bold text-[#012B5C] mb-1">Seleccionar Colaborador</label>
                        <select value={colaboradorSeleccionado} onChange={(e) => setColaboradorSeleccionado(e.target.value)} className="w-full border-2 border-[#012B5C] rounded p-2 text-sm focus:ring-[#D4AF37] font-semibold outline-none">
                          <option value="TODOS">-- Todos los colaboradores --</option>
                          {colaboradoresDisponibles.map((u, idx) => <option key={idx} value={u["Nombre del Talento PC PUMA"]}>{u["Nombre del Talento PC PUMA"]}</option>)}
                        </select>
                      </div>
                    ) : (
                      <div className="col-span-2 text-sm text-gray-500 pt-6">Visualizando tu información personal.</div>
                    )}
                  </div>
                  <button onClick={handlePrint} className="bg-[#012B5C] hover:bg-[#011B3A] text-[#D4AF37] font-semibold py-2 px-6 rounded border border-[#D4AF37] flex items-center gap-2 transition shadow whitespace-nowrap">📄 Descargar PDF</button>
                </div>
              </div>

              {/* RENDERIZADO DINÁMICO DE FICHAS */}
              {colaboradorSeleccionado === "TODOS" ? (
                colaboradoresDisponibles.map(colaborador => renderFichaColaborador(colaborador["Nombre del Talento PC PUMA"]))
              ) : colaboradorSeleccionado ? (
                renderFichaColaborador(colaboradorSeleccionado)
              ) : (
                <p className="text-center text-gray-500 mt-10">No se encontró información para mostrar.</p>
              )}
            </>
          )}

          {/* ===================== VISTA ADMINISTRADOR (CRUD COMPLETO) ===================== */}
          {vistaActiva === "Admin" && esAdmin && (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 print:hidden min-h-[600px]">
              
              {subVistaAdmin === "Menu" && (
                <>
                  <h2 className="text-2xl font-extrabold text-[#012B5C] border-b-2 border-[#D4AF37] pb-4 mb-6">Panel de Administración General</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 shadow-sm flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-blue-900 text-lg mb-4 flex items-center gap-2"><span>👥</span> Gestión de Usuarios</h3>
                        <p className="text-sm text-blue-800 mb-4">Total activos: <strong>{todosLosUsuarios.length}</strong></p>
                      </div>
                      <div className="space-y-3">
                        <button onClick={() => setSubVistaAdmin("CrearUsuario")} className="w-full bg-[#012B5C] text-white py-2 rounded shadow hover:bg-[#011B3A] transition text-sm font-semibold">➕ Crear Nuevo Usuario</button>
                        <button onClick={() => setSubVistaAdmin("ListaUsuarios")} className="w-full bg-white text-[#012B5C] border border-[#012B5C] py-2 rounded shadow hover:bg-gray-50 transition text-sm font-semibold">📋 Ver y Editar Usuarios</button>
                      </div>
                    </div>

                    <div className="bg-amber-50 p-6 rounded-lg border border-amber-100 shadow-sm flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-amber-900 text-lg mb-4 flex items-center gap-2"><span>📚</span> Gestión de Capacitaciones</h3>
                        <p className="text-sm text-amber-800 mb-4">Total asignadas: <strong>{todosLosCursos.length}</strong></p>
                      </div>
                      <div className="space-y-3">
                        <button onClick={() => setSubVistaAdmin("AsignarCurso")} className="w-full bg-[#012B5C] text-white py-2 rounded shadow hover:bg-[#011B3A] transition text-sm font-semibold">➕ Asignar Nuevo Curso</button>
                        <button onClick={() => setSubVistaAdmin("ListaCursosAsignados")} className="w-full bg-white text-[#012B5C] border border-[#012B5C] py-2 rounded shadow hover:bg-gray-50 transition text-sm font-semibold">📋 Ver y Editar Cursos Asignados</button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {subVistaAdmin !== "Menu" && (
                <div className="flex items-center gap-4 border-b-2 border-[#D4AF37] pb-4 mb-6">
                  <button onClick={() => setSubVistaAdmin("Menu")} className="text-[#012B5C] hover:text-[#D4AF37] font-bold text-sm">← Volver al menú</button>
                  <h2 className="text-2xl font-extrabold text-[#012B5C]">
                    {subVistaAdmin === "CrearUsuario" && "Alta de Nuevo Usuario"}
                    {subVistaAdmin === "AsignarCurso" && "Asignar Capacitación"}
                    {subVistaAdmin === "ListaUsuarios" && "Directorio de Usuarios"}
                    {subVistaAdmin === "ListaCursosAsignados" && "Historial de Cursos Asignados"}
                  </h2>
                </div>
              )}

              {subVistaAdmin === "ListaUsuarios" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#012B5C] text-white text-sm">
                        <th className="p-3 rounded-tl-lg">Nombre</th>
                        <th className="p-3">Usuario</th>
                        <th className="p-3">Área</th>
                        <th className="p-3">Perfil</th>
                        <th className="p-3 rounded-tr-lg text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todosLosUsuarios.map((u, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50 text-sm">
                          <td className="p-3 font-semibold text-gray-800">{u["Nombre del Talento PC PUMA"]}</td>
                          <td className="p-3 text-gray-600">{u.Usuario}</td>
                          <td className="p-3 text-gray-600">{u["Área o departamento"]}</td>
                          <td className="p-3"><span className="bg-blue-100 text-blue-800 py-1 px-2 rounded text-xs font-bold">{u["Perfil de usuario"]}</span></td>
                          <td className="p-3 text-center space-x-2">
                            <button onClick={() => setUsuarioModificar(u)} className="bg-amber-500 hover:bg-amber-600 text-white p-2 rounded shadow transition text-xs">✏️ Editar</button>
                            <button onClick={() => handleEliminarUsuarioAdmin(u.Usuario)} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded shadow transition text-xs">🗑️ Borrar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {subVistaAdmin === "ListaCursosAsignados" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#012B5C] text-white text-sm">
                        <th className="p-3 rounded-tl-lg">Colaborador</th>
                        <th className="p-3">Curso</th>
                        <th className="p-3">Estatus</th>
                        <th className="p-3">Costo</th>
                        <th className="p-3 rounded-tr-lg text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todosLosCursos.map((c, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50 text-sm">
                          <td className="p-3 font-semibold text-gray-800">{c["Nombre del colaborador"]}</td>
                          <td className="p-3 text-gray-600">{c["Nombre del curso"]}</td>
                          <td className="p-3">
                            <span className={`py-1 px-2 rounded text-xs font-bold ${c.Estatus?.trim() === 'Concluido' ? 'bg-emerald-100 text-emerald-800' : c.Estatus?.trim() === 'En curso' ? 'bg-amber-100 text-amber-800' : 'bg-gray-200 text-gray-800'}`}>
                              {c.Estatus}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-green-700">${c.Costo}</td>
                          <td className="p-3 text-center space-x-2 whitespace-nowrap">
                            <button onClick={() => setCursoAsignadoModificar(c)} className="bg-amber-500 hover:bg-amber-600 text-white p-2 rounded shadow transition text-xs">✏️ Editar</button>
                            <button onClick={() => handleEliminarCursoAsignadoAdmin(c.id_principal)} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded shadow transition text-xs">🗑️ Borrar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {subVistaAdmin === "CrearUsuario" && (
                <form onSubmit={handleCrearUsuario} className="max-w-2xl mx-auto space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo</label><input required type="text" value={nuevoUsuario["Nombre del Talento PC PUMA"]} onChange={(e) => setNuevoUsuario({...nuevoUsuario, "Nombre del Talento PC PUMA": e.target.value})} className="w-full border rounded p-2 outline-none focus:ring-[#D4AF37]" placeholder="Ej. Juan Pérez" /></div>
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Área o Depto</label><input required type="text" value={nuevoUsuario["Área o departamento"]} onChange={(e) => setNuevoUsuario({...nuevoUsuario, "Área o departamento": e.target.value})} className="w-full border rounded p-2 outline-none focus:ring-[#D4AF37]" placeholder="Ej. Recursos Humanos" /></div>
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Usuario (Login)</label><input required type="text" value={nuevoUsuario.Usuario} onChange={(e) => setNuevoUsuario({...nuevoUsuario, Usuario: e.target.value})} className="w-full border rounded p-2 outline-none focus:ring-[#D4AF37]" placeholder="Ej. jperez" /></div>
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Contraseña</label><input required type="text" value={nuevoUsuario.Contraseña} onChange={(e) => setNuevoUsuario({...nuevoUsuario, Contraseña: e.target.value})} className="w-full border rounded p-2 outline-none focus:ring-[#D4AF37]" placeholder="Asigna contraseña" /></div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-1">Perfil de Acceso</label>
                      <select required value={nuevoUsuario["Perfil de usuario"]} onChange={(e) => setNuevoUsuario({...nuevoUsuario, "Perfil de usuario": e.target.value})} className="w-full border rounded p-2 outline-none focus:ring-[#D4AF37]">
                        <option value="Colaborador">Colaborador</option><option value="Supervisor">Supervisor</option><option value="Coordinador">Coordinador</option><option value="Administrador">Administrador</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end"><button type="submit" disabled={isSubmitting} className={`font-bold py-2 px-8 rounded shadow transition ${isSubmitting ? "bg-gray-400 text-gray-700" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}>Guardar Usuario</button></div>
                </form>
              )}

              {subVistaAdmin === "AsignarCurso" && (
                <form onSubmit={handleCrearCurso} className="max-w-4xl mx-auto space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-3">
                      <label className="block text-sm font-bold text-[#012B5C] mb-1">Selecciona al Colaborador</label>
                      <select required value={nuevoCurso["Nombre del colaborador"]} onChange={(e) => handleSeleccionColaboradorCurso(e.target.value)} className="w-full border-2 border-[#012B5C] rounded p-2 outline-none focus:ring-[#D4AF37]">
                        <option value="">-- Elige colaborador --</option>
                        {todosLosUsuarios.map((u, i) => <option key={i} value={u["Nombre del Talento PC PUMA"]}>{u["Nombre del Talento PC PUMA"]}</option>)}
                      </select>
                    </div>
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Puesto</label><input required type="text" value={nuevoCurso.Puesto} onChange={(e) => setNuevoCurso({...nuevoCurso, Puesto: e.target.value})} className="w-full border rounded p-2 outline-none focus:ring-[#D4AF37]" placeholder="Ej. Desarrollador" /></div>
                    <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Curso</label><select required value={nuevoCurso["Nombre del curso"]} onChange={(e) => setNuevoCurso({...nuevoCurso, "Nombre del curso": e.target.value})} className="w-full border rounded p-2 outline-none focus:ring-[#D4AF37]"><option value="">-- Selecciona --</option>{catCursos.map((c, i) => <option key={i} value={c["Nombre de curso"]}>{c["Nombre de curso"]}</option>)}</select></div>
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Ruta</label><input required type="number" min="1" value={nuevoCurso["Orden de ruta"]} onChange={(e) => setNuevoCurso({...nuevoCurso, "Orden de ruta": e.target.value})} className="w-full border rounded p-2 outline-none focus:ring-[#D4AF37]" /></div>
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Modalidad</label><select required value={nuevoCurso.Modalidad} onChange={(e) => setNuevoCurso({...nuevoCurso, Modalidad: e.target.value})} className="w-full border rounded p-2 outline-none focus:ring-[#D4AF37]"><option value="">-- Selecciona --</option>{catModalidades.map((m, i) => <option key={i} value={m["Modalidad del curso"]}>{m["Modalidad del curso"]}</option>)}</select></div>
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Estatus</label><select required value={nuevoCurso.Estatus} onChange={(e) => setNuevoCurso({...nuevoCurso, Estatus: e.target.value})} className="w-full border rounded p-2 outline-none focus:ring-[#D4AF37]"><option value="">-- Selecciona --</option>{catEstatus.map((est, i) => <option key={i} value={est["Estatus del curso"]}>{est["Estatus del curso"]}</option>)}</select></div>
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Costo ($)</label><input required type="number" value={nuevoCurso.Costo} onChange={(e) => setNuevoCurso({...nuevoCurso, Costo: e.target.value})} className="w-full border rounded p-2 outline-none focus:ring-[#D4AF37]" /></div>
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Inicio (Estimada)</label><input type="text" value={nuevoCurso["Fecha de inicio"]} onChange={(e) => setNuevoCurso({...nuevoCurso, "Fecha de inicio": e.target.value})} className="w-full border rounded p-2 outline-none focus:ring-[#D4AF37]" placeholder="DD/MM/AAAA" /></div>
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Proveedor</label><select required value={nuevoCurso["Proveedor del curso"]} onChange={(e) => setNuevoCurso({...nuevoCurso, "Proveedor del curso": e.target.value})} className="w-full border rounded p-2 outline-none focus:ring-[#D4AF37]"><option value="">-- Selecciona --</option>{catProveedores.map((prov, i) => <option key={i} value={prov["Nombre del proveedor"]}>{prov["Nombre del proveedor"]}</option>)}</select></div>
                  </div>
                  <div className="pt-4 flex justify-end"><button type="submit" disabled={isSubmitting} className={`font-bold py-2 px-8 rounded shadow transition ${isSubmitting ? "bg-gray-400 text-gray-700" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}>Asignar Capacitación</button></div>
                </form>
              )}
            </div>
          )}
        </main>
        
        {/* COMPONENTE FOOTER AL FINAL DEL CONTENIDO PRINCIPAL */}
        <FooterInstitucional />
      </div>
    );
  }

  // ==========================================
  // 7. FORMULARIO LOGIN (CON FOOTER)
  // ==========================================
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-[#012B5C] p-6 text-center">
            <img src="/logopcpuma.png" alt="Logo PC PUMA" className="h-12 w-auto mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold text-[#D4AF37]">Programa Talento PC PUMA</h2>
          </div>
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div><label className="block text-sm font-medium text-gray-700">Usuario</label><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 block w-full px-4 py-2 border rounded-md focus:ring-[#D4AF37] outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Contraseña</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-4 py-2 border rounded-md focus:ring-[#D4AF37] outline-none" /></div>
              <button type="submit" disabled={isLoading} className={`w-full font-bold py-3 px-4 rounded-md shadow-md ${isLoading ? "bg-gray-400" : "bg-[#D4AF37] hover:bg-[#b5952f] text-[#012B5C]"}`}>Ingresar</button>
            </form>
          </div>
        </div>
      </div>
      
      {/* COMPONENTE FOOTER AL FINAL DEL LOGIN */}
      <FooterInstitucional />
    </div>
  );
}