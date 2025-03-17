import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import logo from '../../logo.png'

export default function Signup() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(credentials);
      navigate('/');
    } catch (err) {
      setError('Username already exists');
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
      <img 
      src={logo} 
      alt="Logo" 
      className="auth-logo" 
      />
      <h2>Sign Up</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={credentials.username}
          onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          required
        />
        <button type="submit">Create Account</button>
      </form>
      <button onClick={() => navigate('/login')} className="signup-btn">
          Already have an account? Login
      </button>
    </div>
    </div>
  );
}