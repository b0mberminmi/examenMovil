import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser, clearCurrentUser, AuthUser } from '../../constants/auth';
import getAuthService from '@/services/auth-services';
import { Alert } from 'react-native';
import { decodeJwt } from 'jose'

export interface JwtPayload {
  sub: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Guardar sesión en AsyncStorage
  const saveSessionToStorage = async (userData: AuthUser): Promise<void> => {
    try {
      await AsyncStorage.setItem('@MyApp:CurrentUser', JSON.stringify(userData));
    } catch (error) {
      console.error('Error al guardar sesión:', error);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await getCurrentUser();
      if (storedUser) {
        setUser(storedUser);
      }
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const authClient = getAuthService();
    setLoading(true);

    try {
      const loginResponse = await authClient.login({ email, password });
      
      if (loginResponse.data?.token) {
        const token = loginResponse.data.token;
        const decodedToken = decodeJwt<JwtPayload>(token);

        const loggedInUser: AuthUser = {
          id: decodedToken.sub,
          email: decodedToken.email,
          token: token,
        };

        console.log('✅ Token recibido y usuario autenticado');
        
        // Guardar usuario
        setUser(loggedInUser);
        await saveSessionToStorage(loggedInUser);
        
        Alert.alert('✅ Login exitoso', 'Bienvenido ' + decodedToken.email);
        return true;
      }
      
      Alert.alert('Error', 'Credenciales inválidas');
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      // Loguear como warning (son errores esperados del flujo de app)
      console.warn(`⚠️ Login: ${errorMessage}`);
      
      Alert.alert('Validación requerida', errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    await clearCurrentUser();
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    const authClient = getAuthService();
    setLoading(true);
    try {
      const response = await authClient.register({ email, password });
      if (response.data?.token) {
        const token = response.data.token;
        const decodedToken = decodeJwt<JwtPayload>(token);

        const registeredUser: AuthUser = {
          id: decodedToken.sub,
          email: decodedToken.email,
          token: token,
        };

        setUser(registeredUser);
        await saveSessionToStorage(registeredUser);
        Alert.alert('Registro exitoso', 'Tu cuenta ha sido creada. ¡Bienvenido!');
        return true;
      }
      Alert.alert('Error', 'No se pudo completar el registro');
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      // Loguear como warning (son errores esperados del flujo de app)
      console.warn(`⚠️ Registro: ${errorMessage}`);
      
      Alert.alert('Error al registrarse', errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading: loading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};
