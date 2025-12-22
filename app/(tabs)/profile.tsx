import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import useTodos from '../../hooks/useTodos';
import { useAuth } from '../../components/context/auth-context';

const NEON_GREEN = '#00FF00';
const BLACK = 'black';
const GRAY = '#AAAAAA';

export default function ProfileScreen() {
  const { user } = useAuth();
  const token = user?.token;
  const emailString = user?.email ?? '';

  const { todos, isLoading, reload } = useTodos(token);

  // Recargar resumen cuando la pantalla entra en foco (por ejemplo, después de borrar desde Tareas)
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const totalTodos = todos.length;
  const completedTodos = todos.filter(t => t.completed).length;
  const pendingTodos = totalTodos - completedTodos;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>

      {emailString ? (
        <Text style={styles.email}>{emailString}</Text>
      ) : (
        <Text style={styles.emailPlaceholder}>
          (email no disponible en los parámetros)
        </Text>
      )}

      <View style={styles.separator} />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={NEON_GREEN} />
          <Text style={styles.loadingText}>Cargando resumen de tareas...</Text>
        </View>
      ) : (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Resumen de tareas</Text>

          {totalTodos === 0 ? (
            <Text style={styles.noTodosText}>
              Aún no has creado tareas. Empieza en la pestaña "Tareas".
            </Text>
          ) : (
            <>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total tareas:</Text>
                <Text style={styles.statValue}>{totalTodos}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Completadas:</Text>
                <Text style={styles.statValue}>{completedTodos}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Pendientes:</Text>
                <Text style={styles.statValue}>{pendingTodos}</Text>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLACK,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  title: {
    fontSize: 22,
    color: NEON_GREEN,
    fontWeight: 'bold',
  },
  email: {
    marginTop: 4,
    fontSize: 14,
    color: GRAY,
  },
  emailPlaceholder: {
    marginTop: 4,
    fontSize: 14,
    color: GRAY,
    fontStyle: 'italic',
  },
  separator: {
    height: 1,
    backgroundColor: '#222',
    marginVertical: 16,
  },
  loadingContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  loadingText: {
    color: NEON_GREEN,
    marginTop: 8,
  },
  statsContainer: {
    marginTop: 8,
  },
  statsTitle: {
    fontSize: 18,
    color: NEON_GREEN,
    marginBottom: 12,
  },
  noTodosText: {
    color: GRAY,
    fontSize: 14,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  statLabel: {
    color: GRAY,
    fontSize: 14,
  },
  statValue: {
    color: NEON_GREEN,
    fontSize: 16,
    fontWeight: 'bold',
  },
});