import axios from 'axios';
import { API_URL } from '../constants/config';
import { handleAxiosError, ApiError, isValidEmail } from '../utils/error-handler';

export interface LoginPayload {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    data?: {
        token: string;
    };
}

export type RegisterPayload = LoginPayload;
export type RegisterResponse = LoginResponse;

export default function getAuthService() {
    const client = axios.create({
        baseURL: `${API_URL}/auth`,
        timeout: 10000, // 10 segundos
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    });

    // Interceptor de request para loguear
    client.interceptors.request.use(
        (config) => {
            console.log('📤 Request enviado:', {
                url: config.url,
                method: config.method,
                baseURL: config.baseURL,
                headers: config.headers,
                data: config.data,
            });
            return config;
        },
        (error) => {
            console.error('❌ Error en request:', error);
            return Promise.reject(error);
        }
    );

    // Interceptor de response para loguear
    client.interceptors.response.use(
        (response) => {
            console.log('📥 Response recibido:', response.status);
            return response;
        },
        (error) => {
            // No loguear aquí, handleAxiosError lo hace
            return Promise.reject(error);
        }
    );

    async function login(payload: LoginPayload): Promise<LoginResponse> {
        try {
            // Validación básica de entrada
            if (!payload.email || !payload.password) {
                const msg = 'Email y contraseña son requeridos';
                console.warn('⚠️ Validación login:', msg);
                throw new ApiError(400, msg);
            }

            if (!isValidEmail(payload.email)) {
                const msg = 'El formato del email es inválido';
                console.warn('⚠️ Validación login:', msg);
                throw new ApiError(400, msg);
            }

            if (payload.password.length < 6) {
                const msg = 'La contraseña debe tener al menos 6 caracteres';
                console.warn('⚠️ Validación login:', msg);
                throw new ApiError(400, msg);
            }

            // Normalizar email
            const normalizedPayload = {
                email: payload.email.trim().toLowerCase(),
                password: payload.password
            };

            console.log('🔐 Login payload enviado:', JSON.stringify(normalizedPayload));
            const response = await client.post<LoginResponse>('/login', normalizedPayload);
            console.log('✅ Login exitoso:', response.status);
            return response.data;
        } catch (error) {
            if (error instanceof ApiError) {
                // Si es error de validación, simplemente lanzar
                throw error;
            }
            // handleAxiosError ya loguea el error
            throw handleAxiosError(error, 'Error al iniciar sesión');
        }
    }

    async function register(payload: RegisterPayload): Promise<RegisterResponse> {
        try {
            // Validación básica de entrada
            if (!payload.email || !payload.password) {
                const msg = 'Email y contraseña son requeridos';
                console.warn('⚠️ Validación registro:', msg);
                throw new ApiError(400, msg);
            }

            if (!isValidEmail(payload.email)) {
                const msg = 'El formato del email es inválido';
                console.warn('⚠️ Validación registro:', msg);
                throw new ApiError(400, msg);
            }

            if (payload.password.length < 6) {
                const msg = 'La contraseña debe tener al menos 6 caracteres';
                console.warn('⚠️ Validación registro:', msg);
                throw new ApiError(400, msg);
            }

            // Normalizar email
            const normalizedPayload = {
                email: payload.email.trim().toLowerCase(),
                password: payload.password
            };

            console.log('🔐 Registro payload enviado:', JSON.stringify(normalizedPayload));
            const response = await client.post<RegisterResponse>('/register', normalizedPayload);
            console.log('✅ Registro exitoso:', response.status);
            return response.data;
        } catch (error) {
            if (error instanceof ApiError) {
                // Si es error de validación, simplemente lanzar
                throw error;
            }
            // handleAxiosError ya loguea el error
            throw handleAxiosError(error, 'Error al registrarse');
        }
    }

    return {
        login,
        register,
    };
}
