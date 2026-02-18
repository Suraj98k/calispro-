import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiClient from '../api/client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginSchema = z.infer<typeof loginSchema>;
type SignupSchema = z.infer<typeof signupSchema>;

export const useLoginMutation = (options?: { callbackUrl?: string }) => {
  const { login } = useAuth();

  return useMutation({
    mutationFn: async (credentials: LoginSchema) => {
      const { data } = await apiClient.post('/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      toast.success('Successfully logged in!');
      login(data.token, { callbackUrl: options?.callbackUrl });
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError.response?.data?.message || 'Invalid email or password.';
      toast.error(message);
    },
  });
};

export const useSignupMutation = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (userData: SignupSchema) => {
      const { data } = await apiClient.post('/auth/signup', userData);
      return data;
    },
    onSuccess: () => {
      toast.success('Account created successfully. Please log in to continue.');
      router.push('/login');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError.response?.data?.message || 'Failed to create account.';
      toast.error(message);
    },
  });
};
