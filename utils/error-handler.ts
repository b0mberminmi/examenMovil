import axios from 'axios';

export class ApiError extends Error {
  constructor(
    public code: number | string,
    public message: string,
    public details?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Valida formato de email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Mapea códigos de estado HTTP a mensajes descriptivos
 */
export const getErrorMessage = (status: number, context?: string): string => {
  const baseMsg = context ? `${context}: ` : '';

  switch (status) {
    case 400:
      return `${baseMsg}Solicitud inválida. Verifica los datos ingresados.`;
    case 401:
      return `${baseMsg}No autorizado. Por favor, inicia sesión de nuevo.`;
    case 403:
      return `${baseMsg}Acceso denegado. No tienes permiso para realizar esta acción.`;
    case 404:
      return `${baseMsg}Recurso no encontrado.`;
    case 409:
      return `${baseMsg}Conflicto: El usuario o recurso ya existe.`;
    case 422:
      return `${baseMsg}Datos inválidos. Verifica el formato de los campos.`;
    case 500:
      return `${baseMsg}Error del servidor. Intenta más tarde.`;
    case 502:
    case 503:
    case 504:
      return `${baseMsg}El servidor no está disponible. Intenta más tarde.`;
    default:
      return `${baseMsg}Ocurrió un error desconocido (${status}).`;
  }
};

/**
 * Maneja errores de Axios y devuelve un ApiError estructurado
 */
export const handleAxiosError = (error: unknown, context?: string): ApiError => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 0;
    let serverMessage = '';

    // Intenta extraer mensaje detallado del servidor
    if (error.response?.data?.error) {
      // Error de Zod validation
      if (typeof error.response.data.error.message === 'string') {
        try {
          const parsed = JSON.parse(error.response.data.error.message);
          if (Array.isArray(parsed) && parsed.length > 0) {
            serverMessage = parsed[0].message || error.response.data.error.message;
          }
        } catch {
          serverMessage = error.response.data.error.message;
        }
      } else {
        serverMessage = String(error.response.data.error);
      }
    } else {
      serverMessage =
        error.response?.data?.message ||
        error.response?.data?.msg ||
        error.message;
    }

    const message = getErrorMessage(status, context);

    // Log como warn en lugar de error (son errores esperados del flujo de app)
    console.warn(`⚠️ HTTP ${status}: ${serverMessage || message}`);

    return new ApiError(status, message, serverMessage as string);
  }

  if (error instanceof Error) {
    return new ApiError('UNKNOWN', error.message);
  }

  return new ApiError('UNKNOWN', 'Error desconocido');
};

/**
 * Valida un token JWT básicamente
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    // Decodificar sin verificar firma (para validación local)
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    const payload = JSON.parse(atob(parts[1]));
    const exp = payload.exp;

    if (!exp) return false;

    // exp está en segundos, Date.now() en milisegundos
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
};
