import AsyncStorage from '@react-native-async-storage/async-storage';

export const CURRENT_USER_STORAGE_KEY = '@MyApp:CurrentUser';

// Usuario autenticado persistido
export interface AuthUser {
  id: string;
  email: string;
  token: string;
}

export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

// Se obtiene el usuario actual desde AsyncStorage
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const stored = await AsyncStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (!stored) return null;

    try {
      const parsed = JSON.parse(stored) as Partial<AuthUser>;
      if (parsed?.email && parsed?.token && parsed?.id) {
        return {
          id: String(parsed.id),
          email: parsed.email.trim().toLowerCase(),
          token: parsed.token,
        };
      }
    } catch (parseError) {
      console.warn('Error al parsear usuario almacenado:', parseError);
      return null;
    }

    return null;
  } catch (error) {
    console.error('Error al leer el usuario actual:', error);
    return null;
  }
};

// Se elimina el usuario actual de asyncStorage
export const clearCurrentUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  } catch (error) {
    console.error('Error al limpiar el usuario actual:', error);
  }
};