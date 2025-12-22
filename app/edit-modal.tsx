import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import useTodos from '../hooks/useTodos';
import { useAuth } from '../components/context/auth-context';

const NEON_GREEN = '#00FF00';
const BLACK = 'black';
const INACTIVE_NEON = '#006600';

export default function EditModalScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const token = user?.token;
  const { updateTodo, error } = useTodos(token);

  // Mostrar errores cuando ocurren
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const { id, title: initialTitle } = useLocalSearchParams<{
    id: string;
    title: string;
  }>();

  const [title, setTitle] = useState(initialTitle || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateTodo = async () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      Alert.alert('Título requerido', 'Por favor ingresa un título para la tarea.');
      return;
    }

    if (!id) {
      Alert.alert('Error', 'No se encontró la tarea a editar');
      return;
    }

    setIsUpdating(true);

    try {
      await updateTodo(id, { title: trimmedTitle });
      Alert.alert('Éxito', 'Tarea actualizada correctamente');
      router.back();
    } catch (err) {
      Alert.alert('Error al actualizar', err instanceof Error ? err.message : 'No se pudo actualizar la tarea');
      console.error('Error actualizando tarea:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Text style={styles.closeText}>Cerrar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Editar tarea</Text>

      <TextInput
        style={styles.input}
        placeholder="Título de la tarea..."
        placeholderTextColor={INACTIVE_NEON}
        value={title}
        onChangeText={setTitle}
        editable={!isUpdating}
      />

      <TouchableOpacity
        style={[styles.updateButton, isUpdating && styles.updateButtonDisabled]}
        onPress={handleUpdateTodo}
        disabled={isUpdating}
      >
        <Text style={styles.updateButtonText}>
          {isUpdating ? 'Actualizando...' : 'Actualizar'}
        </Text>
      </TouchableOpacity>
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
  input: {
    borderWidth: 1,
    borderColor: NEON_GREEN,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: NEON_GREEN,
    marginBottom: 20,
  },
  updateButton: {
    backgroundColor: NEON_GREEN,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  updateButtonDisabled: {
    backgroundColor: INACTIVE_NEON,
  },
  updateButtonText: {
    color: BLACK,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
