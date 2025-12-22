import React, { useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { launchCameraAsync, MediaTypeOptions } from 'expo-image-picker';
import * as Location from 'expo-location';

const NEON_GREEN = '#00FF00';
const INACTIVE_NEON = '#006600';
const BLACK = 'black';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface TodoFormProps {
  onCreateTodo: (task: {
    title: string;
    photoUri?: string;
    location?: LocationCoords;
  }) => Promise<void>;
}

const TodoForm: React.FC<TodoFormProps> = ({ onCreateTodo }) => {
  const [title, setTitle] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const handlePickImage = async () => {
    try {
      const result = await launchCameraAsync({
        mediaTypes: MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.3,
      });


      if (!result.canceled && result.assets[0]) {
        const photoAsBlob = await fetch(result.assets[0].uri).then(res => res.blob());
        setPhotoUri(result.assets[0].uri);
        // Obtener ubicación después de capturar la foto
        await handleGetLocation();
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo acceder a la cámara');
    }
  };

  const handleGetLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se requiere permiso de ubicación');
        setIsLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      Alert.alert('Error', 'No se pudo obtener la ubicación');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleCreateTodo = async () => {
    const trimmedTitle = title.trim();

    // Validación de título
    if (!trimmedTitle) {
      Alert.alert('Título requerido', 'Por favor ingresa un título para la tarea.');
      return;
    }

    if (isCreating || isLoadingLocation) return;

    setIsCreating(true);

    try {
      await onCreateTodo({
        title: trimmedTitle,
        photoUri: photoUri || undefined,
        location: location || undefined,
      });

      setTitle('');
      setPhotoUri(null);
      setLocation(null);
    } catch (error) {
      console.error('Error al crear la tarea:', error);
      Alert.alert(
        'Error de creación',
        'Hubo un problema al guardar la tarea.'
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View style={styles.formContainer}>
      <TextInput
        style={styles.input}
        placeholder="Título de la tarea..."
        placeholderTextColor={INACTIVE_NEON}
        value={title}
        onChangeText={setTitle}
        editable={!isCreating}
      />

      {photoUri && (
        <View style={styles.photoContainer}>
          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
          <TouchableOpacity
            onPress={() => setPhotoUri(null)}
            style={styles.removePhotoButton}
          >
            <FontAwesome name="close" size={16} color={BLACK} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.cameraButton, isCreating && styles.buttonDisabled]}
          onPress={handlePickImage}
          disabled={isCreating}
        >
          <FontAwesome
            name="camera"
            size={18}
            color={isCreating ? INACTIVE_NEON : NEON_GREEN}
          />
          <Text
            style={[
              styles.cameraButtonText,
              isCreating && styles.buttonTextDisabled,
            ]}
          >
            Foto
          </Text>
        </TouchableOpacity>

        {location && (
          <View style={styles.locationInfo}>
            <FontAwesome name="map-marker" size={14} color={NEON_GREEN} />
            <Text style={styles.locationInfoText}>
              Lat: {location.latitude.toFixed(2)}, Lon: {location.longitude.toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      {isLoadingLocation && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={NEON_GREEN} />
          <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.createButton,
          (isCreating || isLoadingLocation) && styles.createButtonDisabled,
        ]}
        onPress={handleCreateTodo}
        disabled={isCreating || isLoadingLocation}
      >
        {isCreating ? (
          <Text style={styles.createButtonText}>Creando tarea...</Text>
        ) : (
          <Text style={styles.createButtonText}>Crear tarea</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    padding: 16,
    backgroundColor: BLACK,
    borderTopWidth: 1,
    borderTopColor: INACTIVE_NEON,
  },
  input: {
    borderWidth: 1,
    borderColor: NEON_GREEN,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: NEON_GREEN,
    marginBottom: 12,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  photoPreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: NEON_GREEN,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: NEON_GREEN,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: NEON_GREEN,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  cameraButtonText: {
    color: NEON_GREEN,
    fontWeight: '600',
  },
  buttonDisabled: {
    borderColor: INACTIVE_NEON,
  },
  buttonTextDisabled: {
    color: INACTIVE_NEON,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 10,
    gap: 6,
  },
  locationInfoText: {
    fontSize: 12,
    color: NEON_GREEN,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  loadingText: {
    color: NEON_GREEN,
    fontSize: 12,
  },
  createButton: {
    backgroundColor: NEON_GREEN,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: INACTIVE_NEON,
  },
  createButtonText: {
    color: BLACK,
    fontWeight: 'bold',
  },
});

export default TodoForm;