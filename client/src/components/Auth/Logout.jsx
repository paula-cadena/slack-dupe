import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuthStorage } from '../../utils/api';

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    clearAuthStorage();
   
    navigate('/login', { replace: true });
  }, [navigate]);

  return null;
}