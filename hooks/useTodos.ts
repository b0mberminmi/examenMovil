import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import getTodoService, { TodoApi } from '../services/todo-services';
import { ApiError } from '../utils/error-handler';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  photoUri?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

const useTodos = (token: string | undefined) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const mapTodo = (apiTodo: TodoApi): Todo => ({
    id: apiTodo.id,
    title: apiTodo.title,
    completed: Boolean(apiTodo.completed),
    photoUri: apiTodo.photoUri,
    location: apiTodo.location,
  });

  const loadTodos = useCallback(async () => {
    if (!token) {
      setTodos([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setError(null);
    const service = getTodoService({ token });
    try {
      const response = await service.getTodos();
      const mapped = response.data?.map(mapTodo) ?? [];
      if (isMountedRef.current) {
        setTodos(mapped);
        setCount(response.count ?? mapped.length);
      }
    } catch (error) {
      const errorMsg = error instanceof ApiError ? error.message : 'Error desconocido al cargar tareas';
      console.error('Error al cargar tareas desde API:', errorMsg);
      if (isMountedRef.current) {
        setError(errorMsg);
        setTodos([]);
        setCount(0);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [token]);

  useEffect(() => {
    setIsLoading(true);
    loadTodos();
  }, [loadTodos]);

  // Permite recargar explícitamente
  const reload = useCallback(() => {
    setIsLoading(true);
    setError(null);
    loadTodos();
  }, [loadTodos]);

  const createTodo = useCallback(
    async (task: { 
      title: string; 
      description?: string;
      photoUri?: string;
      location?: {
        latitude: number;
        longitude: number;
      };
    }) => {
      if (!token) return;
      const service = getTodoService({ token });
      try {
        setError(null);
        const created = await service.createTodo(task);
        const mapped = mapTodo(created);
        setTodos(prev => [...prev, mapped]);
        setCount(prev => prev + 1);
      } catch (error) {
        const errorMsg = error instanceof ApiError ? error.message : 'Error al crear tarea';
        console.error('Error al crear tarea:', errorMsg);
        setError(errorMsg);
        throw error;
      }
    },
    [token]
  );

  const deleteTodo = useCallback(
    async (id: string) => {
      if (!token) return;
      const service = getTodoService({ token });
      try {
        setError(null);
        await service.deleteTodo(id);
        setTodos(prev => prev.filter(t => t.id !== id));
        setCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        const errorMsg = error instanceof ApiError ? error.message : 'Error al eliminar tarea';
        console.error('Error al eliminar tarea:', errorMsg);
        setError(errorMsg);
        throw error;
      }
    },
    [token]
  );

  const toggleTodo = useCallback(
    async (id: string) => {
      if (!token) return;
      const current = todos.find(t => t.id === id);
      if (!current) return;

      const service = getTodoService({ token });
      try {
        setError(null);
        const updated = await service.toggleTodo(id, !current.completed);
        const mapped = mapTodo(updated);
        setTodos(prev => prev.map(t => (t.id === id ? mapped : t)));
      } catch (error) {
        const errorMsg = error instanceof ApiError ? error.message : 'Error al actualizar tarea';
        console.error('Error al actualizar tarea:', errorMsg);
        setError(errorMsg);
        throw error;
      }
    },
    [token, todos]
  );

  const updateTodo = useCallback(
    async (id: string, updates: Partial<{ title: string; photoUri?: string; location?: Todo['location'] }>) => {
      if (!token) return;
      const current = todos.find(t => t.id === id);
      if (!current) return;

      const service = getTodoService({ token });
      try {
        setError(null);
        // Combinar datos actuales con los cambios
        const updatedTask = {
          title: updates.title ?? current.title,
          photoUri: updates.photoUri ?? current.photoUri,
          location: updates.location ?? current.location,
        };

        const updated = await service.updateTodo(id, updatedTask);
        const mapped = mapTodo(updated);
        setTodos(prev => prev.map(t => (t.id === id ? mapped : t)));
      } catch (error) {
        const errorMsg = error instanceof ApiError ? error.message : 'Error al actualizar tarea';
        console.error('Error al actualizar tarea:', errorMsg);
        setError(errorMsg);
        throw error;
      }
    },
    [token, todos]
  );

  const activeTodos = useMemo(() => todos.filter(t => !t.completed), [todos]);
  const completedTodos = useMemo(() => todos.filter(t => t.completed), [todos]);

  return {
    todos,
    activeTodos,
    completedTodos,
    count,
    isLoading,
    error,
    createTodo,
    deleteTodo,
    toggleTodo,
    updateTodo,
    reload,
  };
};

export default useTodos;