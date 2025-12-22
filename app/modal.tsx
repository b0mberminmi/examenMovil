import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import TodoForm from '../components/TodoForm';
import useTodos from '../hooks/useTodos';
import { useAuth } from '../components/context/auth-context';
import getImageService from '../services/image-services';

const NEON_GREEN = '#00FF00';
const BLACK = 'black';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

export default function ModalScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const token = user?.token;
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { createTodo, error, reload } = useTodos(token);

  // Mostrar errores cuando ocurren
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const handleCreateFromModal = async (task: {
    title: string;
    photoUri?: string;
    location?: LocationCoords;
  }) => {
    if (!token) {
      Alert.alert('Error', 'No hay sesión activa');
      return;
    }

    setIsUploadingImage(true);

    try {
      // Crear tarea con la URI local de la foto (sin intentar subirla a /images)
      // La API acepta photoUri como string de la ubicación local
      await createTodo({
        title: task.title,
        photoUri: task.photoUri, // Enviar URI local directamente
        location: task.location,
      });

      reload(); // Recargar lista de tareas
      router.back(); // cerramos modal
    } catch (err) {
      console.error('Error al crear tarea:', err);
      Alert.alert('Error al crear tarea', err instanceof Error ? err.message : 'No se pudo crear la tarea');
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Text style={styles.closeText}>Cerrar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Crear nueva tarea</Text>

      <TodoForm onCreateTodo={handleCreateFromModal} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLACK,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  closeText: {
    color: NEON_GREEN,
    fontSize: 16,
  },
  title: {
    color: NEON_GREEN,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});