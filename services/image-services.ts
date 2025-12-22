import axios from 'axios';
import { API_URL } from '../constants/config';

export interface ImageResponse {
  success: boolean;
  data: {
    url: string;
    key: string;
    size: number;
    contentType: string;
  };
}

export default function getImageService({ token }: { token: string }) {
  const client = axios.create({
    baseURL: `${API_URL}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  async function uploadImage(imageUri: string): Promise<string> {
    try {
      const formData = new FormData();
      
      // Obtener el nombre y tipo del archivo
      const filename = imageUri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      console.log('Intentando subir imagen:', { filename, type, baseURL: client.defaults.baseURL });

      // Intentar con campo "file" primero (el más común)
      formData.append('file', {
        uri: imageUri,
        name: filename,
        type: type,
      } as any);

      // POST directo a /images (axios no concatenará baseURL si la ruta comienza con /)
      const response = await client.post<ImageResponse>('/images', formData, {
        maxContentLength: 5 * 1024 * 1024, // 5MB máximo
        maxBodyLength: 5 * 1024 * 1024,
        timeout: 30000, // 30 segundos timeout
      });

      console.log('Respuesta exitosa de carga de imagen:', response.data);

      if (!response.data?.data?.url) {
        throw new Error('URL de imagen no disponible en la respuesta');
      }

      return response.data.data.url;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error de Axios:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          code: error.code,
        });
        if (error.response?.status === 401) {
          throw new Error('No autorizado para subir imágenes');
        }
        if (error.response?.status) {
          throw new Error(`Error HTTP ${error.response.status} al subir imagen`);
        }
        // Network error o timeout
        throw new Error(`Error de red: ${error.message}`);
      }
      console.error('Error al subir imagen (no-axios):', error);
      throw new Error(`Error al subir la imagen: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return {
    uploadImage,
  };
}
