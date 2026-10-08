import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

// Componente: Pantalla de Login
function Login({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Petición al Backend en Node.js
      const res = await axios.post('http://localhost:3000/api/auth/login', { username, password });
      const jwt = res.data.token;
      localStorage.setItem('token', jwt);
      setToken(jwt);
      navigate('/dashboard');
    } catch (err) {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div style={{ padding: '50px', maxWidth: '400px', margin: 'auto' }}>
      <h2>Acceso al Consultorio</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div>
          <label>Usuario:</label>
          <input type="text" onChange={e => setUsername(e.target.value)} required />
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>Contraseña:</label>
          <input type="password" onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" style={{ marginTop: '20px' }}>Ingresar</button>
      </form>
    </div>
  );
}

// Componente: Dashboard Protegido
function Dashboard() {
  const [data, setData] = useState('');
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data.mensaje + " " + res.data.datos);
    } catch (err) {
      setError('Error al obtener datos seguros. Token inválido.');
    }
  };

  return (
    <div style={{ padding: '50px' }}>
      <h2>Dashboard Médico (Seguro)</h2>
      <button onClick={fetchDashboardData}>Obtener Expedientes</button>
      {data && <p style={{ color: 'green', marginTop: '20px' }}>{data}</p>}
      {error && <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>}
    </div>
  );
}

// Configuración de Rutas y Protección
export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route 
          path="/dashboard" 
          element={token ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}