import { useAuthContext } from '../context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const { user, login, logout, loading } = useAuthContext();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await api.post('/auth/login', credentials);
      return response.data.data;
    },
    onSuccess: (data) => {
      login(data.user, data.token);
      toast.success('Login successful!');
      navigate('/dashboard');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });

  return {
    user,
    loading,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout,
  };
};
