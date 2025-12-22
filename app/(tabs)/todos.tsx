import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import {
    ActivityIndicator,
  Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import TodoItem from '../../components/TodoItem';
import useTodos, { Todo } from '../../hooks/useTodos';
import { useAuth } from '../../components/context/auth-context';

const NEON_GREEN = '#00FF00';
const BLACK = 'black';

export default function TodosScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const token = user?.token;
  const emailString = user?.email ?? '';

  const {
    todos,
    activeTodos,
    completedTodos,
    count,
    isLoading,
    error,
    deleteTodo,
    toggleTodo,
    reload,
  } = useTodos(token);

  // Mostrar errores cuando ocurren
  React.useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const handleToggleRequest = (todo: Todo) => {
    toggleTodo(todo.id).catch((err) => {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo actualizar la tarea');
    });
  };

  const handleDeleteRequest = (todo: Todo) => {
    Alert.alert(
    "Confirmar eliminación",
    `¿Seguro que quieres eliminar la tarea"?`,
    [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          deleteTodo(todo.id).catch((err) => {
            Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo eliminar la tarea');
          });
        },
      },
    ]
  );
  };

  const handleEditRequest = (todo: Todo) => {
    router.push({
      pathname: '/edit-modal',
      params: {
        id: todo.id,
        title: todo.title,
      },
    });
  };

  // Recargar las tareas cada vez que la pantalla vuelve a estar en foco
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  // Renderizado
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis tareas ({count})</Text>
        {emailString ? (
          <Text style={styles.headerSubtitle}>{emailString}</Text>
        ) : null}
        {activeTodos.length > 0 ? (
          <Text style={styles.hintText}>
            Selecciona una tarea para marcarla como completada.
          </Text>
        ) : null}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={NEON_GREEN} />
          <Text style={styles.loadingText}>Cargando tareas...</Text>
        </View>
      ) : todos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aún no has creado tareas.</Text>
          <Text style={styles.emptyHint}>
            Crea tu primera tarea usando el botón +.
          </Text>
        </View>
      ) : (
        <FlatList
          data={activeTodos}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <TodoItem
              todo={item}
              onToggleRequest={handleToggleRequest}
              onDeleteRequest={handleDeleteRequest}
              onEditRequest={handleEditRequest}
            />
          )}
          ListFooterComponent={
            completedTodos.length > 0 ? (
              <View style={styles.completedSection}>
                <Text style={styles.completedTitle}>Tareas completadas</Text>
                {completedTodos.map(todo => (
                  <View key={todo.id} style={styles.completedItemWrapper}>
                    <TodoItem
                      todo={todo}
                      onToggleRequest={handleToggleRequest}
                      onDeleteRequest={handleDeleteRequest}
                      onEditRequest={handleEditRequest}
                    />
                  </View>
                ))}
              </View>
            ) : null
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/modal')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLACK,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    color: NEON_GREEN,
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#AAAAAA',
    fontSize: 12,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: NEON_GREEN,
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    color: NEON_GREEN,
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyHint: {
    color: '#AAAAAA',
    fontSize: 13,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 80,
  },
  separator: {
    height: 10,
  },
  completedSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingTop: 12,
  },
  completedTitle: {
    color: NEON_GREEN,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  completedItemWrapper: {
    marginBottom: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: NEON_GREEN,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: {
    fontSize: 36,
    color: 'black',
    marginTop: -3,
  },
  hintText: {
    color: '#AAAAAA',
    fontSize: 13,
    marginTop: 6,
  },
});
