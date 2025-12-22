import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../components/context/auth-context';

export default function LogoutButton() {
  const router = useRouter();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      // Cerrar sesión usando el contexto
      await logout();
      router.replace('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert(
        'Error',
        'Ocurrió un problema al cerrar sesión. Intenta nuevamente.'
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

    return (
    <TouchableOpacity
        onPress={handleLogout}
        style={styles.button}
        disabled={isLoggingOut}
    >
        {isLoggingOut ? (
        <ActivityIndicator size="small" color="#00FF00" />
        ) : (
        <FontAwesome name="power-off" size={20} color="#00FF00" />
        )}
    </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
  button: {
    marginRight: 12,
  },
});