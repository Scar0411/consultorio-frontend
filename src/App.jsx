import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import './App.css';

function MainApp() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [datosPacientes, setDatosPacientes] = useState(null);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    
    if (res.ok) {
      setToken(data.token);
      setMensaje('');
      setUsername(''); // Limpiamos por seguridad al entrar
      setPassword(''); // Limpiamos por seguridad al entrar
      navigate('/dashboard'); 
    } else {
      setMensaje(data.mensaje);
      // AQUÍ: Limpiamos los campos para que vuelva a intentarlo si se equivocó
      setUsername('');
      setPassword('');
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        alert("✅ ¡ÉXITO! " + data.mensaje); 
        setMensaje(data.mensaje);
        
        // AQUÍ: Limpiamos los campos para que no pasen a la pantalla de Login
        setUsername('');
        setPassword('');
        
        setTimeout(() => {
          setMensaje('');
          navigate('/login'); 
        }, 2000);
      } else {
        alert("❌ ERROR: " + data.mensaje + (data.error ? " Detalles: " + data.error : ""));
        setMensaje(data.mensaje);
        // Borramos la contraseña si hubo un error en el registro (ej. usuario duplicado)
        setPassword('');
      }
    } catch (error) {
      alert("❌ Error crítico: El servidor Backend está apagado o no responde.");
    }
  };

  const obtenerExpedientes = async () => {
    const res = await fetch('/api/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      setMensaje(data.mensaje);
      setDatosPacientes(data.pacientes);
    } else {
      setMensaje(data.mensaje);
      if (res.status === 401 || res.status === 403) cerrarSesion();
    }
  };

  const cerrarSesion = () => {
    setToken('');
    setDatosPacientes(null);
    setMensaje('');
    setUsername('');
    setPassword('');
    navigate('/login'); // Expulsa al usuario al login
  };

  return (
    <div className="app-container">
      {/* Botón de cerrar sesión global en la esquina superior */}
      {token && (
        <button onClick={cerrarSesion} className="btn-logout">Cerrar Sesión</button>
      )}

      <Routes>
        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route path="/login" element={
          <div className="card">
            <div className="card-header">
              <h2>Portal Médico</h2>
              <p>Acceso Seguro</p>
            </div>
            <form onSubmit={handleLogin}>
              <input type="text" placeholder="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} required />
              <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="submit" className="btn-primary">Iniciar Sesión</button>
            </form>
            {mensaje && <p className="alert-error">{mensaje}</p>}
            <p className="switch-text">¿No tienes cuenta? <span onClick={() => { setMensaje(''); navigate('/registro'); }} className="link">Regístrate aquí</span></p>
          </div>
        } />

        <Route path="/registro" element={
          <div className="card">
            <div className="card-header">
              <h2>Nuevo Registro</h2>
              <p>Alta de personal médico</p>
            </div>
            <form onSubmit={handleRegistro}>
              <input type="text" placeholder="Nuevo Usuario" value={username} onChange={(e) => setUsername(e.target.value)} required />
              <input type="password" placeholder="Nueva Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="submit" className="btn-success">Registrar Médico</button>
            </form>
            {mensaje && <p className={mensaje.includes('exitosamente') ? "alert-success" : "alert-error"}>{mensaje}</p>}
            <p className="switch-text">¿Ya tienes cuenta? <span onClick={() => { setMensaje(''); navigate('/login'); }} className="link">Vuelve al Login</span></p>
          </div>
        } />

        <Route path="/dashboard" element={
          token ? (
            <div className="card dashboard-card">
              <div className="card-header">
                <h2>Dashboard Médico (Zero Trust)</h2>
                <p>Bienvenido, {username}</p>
              </div>
              
              <div className="dashboard-actions">
                <button onClick={obtenerExpedientes} className="btn-primary">Obtener Expedientes Seguros</button>
              </div>

              {mensaje && <div className="alert-success-box">{mensaje}</div>}
              
              {datosPacientes && (
                <div className="pacientes-lista">
                  <h3>Expedientes de Hoy:</h3>
                  <ul>
                    {datosPacientes.map(paciente => (
                      <li key={paciente.id}>
                        <strong>{paciente.nombre}</strong> - {paciente.sintomas}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  );
}