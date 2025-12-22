import axios from 'axios';
import { API_URL } from '../constants/config';
import { handleAxiosError, ApiError } from '../utils/error-handler';

export interface Task {
    title: string;
    description?: string;
    photoUri?: string;
    location?: {
        latitude: number;
        longitude: number;
    };
}

export interface TodoApi {
    id: string;
    title: string;
    completed: boolean;
    photoUri?: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface GetTodosResponse {
    success: boolean;
    data: TodoApi[];
    count?: number;
}

export interface CreateTodoResponse {
    success: boolean;
    data: TodoApi;
}

export interface UpdateTodoResponse {
    success: boolean;
    data: TodoApi;
}

export default function getTodoService({ token }: { token: string }) {
    const client = axios.create({
        baseURL: `${API_URL}/todos`,
        headers: {
            Authorization: `Bearer ${token}`,
        },
        timeout: 10000, // 10 segundos
    });

    async function getTodos(): Promise<GetTodosResponse> {
        try {
            const response = await client.get<GetTodosResponse>('');
            
            // La API devuelve { success, data: [...], count }
            if (!response.data) {
                return { success: true, data: [], count: 0 };
            }

            // Validar que data sea array
            if (!Array.isArray(response.data.data)) {
                return { success: true, data: [], count: 0 };
            }

            return response.data;
        } catch (error) {
            if (error instanceof ApiError) {
                if (error.code === 401) {
                    throw error;
                }
                if (error.code === 404) {
                    return { success: true, data: [], count: 0 };
                }
                throw error;
            }
            throw handleAxiosError(error, 'Error al cargar tareas');
        }
    }

    async function createTodo(task: Task): Promise<TodoApi> {
        try {
            if (!task.title || task.title.trim().length === 0) {
                throw new ApiError(400, 'El título de la tarea es requerido');
            }

            const response = await client.post<CreateTodoResponse>('', task);
            if (!response.data?.data) {
                throw new ApiError(500, 'Respuesta inválida del servidor');
            }
            return response.data.data;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw handleAxiosError(error, 'Error al crear tarea');
        }
    }

    async function toggleTodo(id: string, completed: boolean): Promise<TodoApi> {
        try {
            const response = await client.patch<UpdateTodoResponse>(`/${id}`, { completed });
            if (!response.data?.data) {
                throw new ApiError(500, 'Respuesta inválida del servidor');
            }
            return response.data.data;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw handleAxiosError(error, 'Error al actualizar tarea');
        }
    }

    async function deleteTodo(id: string): Promise<void> {
        try {
            await client.delete(`/${id}`);
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw handleAxiosError(error, 'Error al eliminar tarea');
        }
    }

    async function updateTodo(id: string, task: Task): Promise<TodoApi> {
        try {
            if (!task.title || task.title.trim().length === 0) {
                throw new ApiError(400, 'El título de la tarea es requerido');
            }

            const response = await client.patch<UpdateTodoResponse>(`/${id}`, task);
            if (!response.data?.data) {
                throw new ApiError(500, 'Respuesta inválida del servidor');
            }
            return response.data.data;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw handleAxiosError(error, 'Error al actualizar tarea');
        }
    }

    return {
        getTodos,
        createTodo,
        toggleTodo,
        deleteTodo,
        updateTodo,
    };
}
