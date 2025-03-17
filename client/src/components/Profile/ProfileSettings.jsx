import { useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import logo from '../../logo.png'

export default function ProfileSettings() {
  const [form, setForm] = useState({
    newUsername: '',
    currentPassword: '',
    newPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/profile', form);
      setSuccess('Profile updated successfully');
      setError('');
      
      if (form.newUsername) {
        localStorage.removeItem('token');
        await logout();
        window.location.href = '/login';
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Update failed');
      setSuccess('');
    }
  };

  return (
    <div className="profile-settings">
      <img 
        src={logo} 
        alt="Logo" 
        className="auth-logo" 
        />
      <h2>Profile Settings</h2>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="New username"
          value={form.newUsername}
          onChange={(e) => setForm({ ...form, newUsername: e.target.value })}
        />
        <input
          type="password"
          placeholder="Current password"
          value={form.currentPassword}
          onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="New password"
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        />
        <button type="submit">Save Changes</button>
        <button 
          type="button" 
          onClick={() => navigate('/')} 
          className="logout-btn"
        >
          Back
        </button>
      </form>
    </div>
  );
}