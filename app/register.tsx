import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { isValidEmail } from '../constants/auth';
import { useAuth } from '../components/context/auth-context';

const NEON_GREEN = '#00FF00';
const BLACK = 'black';
const INACTIVE_NEON = '#006600';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    setError('');

    if (!isValidEmail(email)) {
      setError('Ingresa un email válido.');
      return;
    }

    if (!password) {
      setError('Ingresa una contraseña.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await register(email.trim(), password.trim());

      if (!success) {
        setError('No se pudo crear la cuenta.');
        return;
      }

      // El registro exitoso redirige automáticamente
      router.replace('/(tabs)/todos');
    } catch (err) {
      console.error('Error al registrarse:', err);
      setError((err as Error).message || 'Error al crear la cuenta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Cuenta</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={INACTIVE_NEON}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        editable={!isSubmitting}
      />

      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="Mínimo 6 caracteres"
        placeholderTextColor={INACTIVE_NEON}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!isSubmitting}
      />

      <Text style={styles.label}>Confirmar Contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="Confirma tu contraseña"
        placeholderTextColor={INACTIVE_NEON}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        editable={!isSubmitting}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[
          styles.registerButton,
          { opacity: !email || !password || !confirmPassword || isSubmitting ? 0.5 : 1 },
        ]}
        disabled={!email || !password || !confirmPassword || isSubmitting}
        onPress={handleRegister}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color={BLACK} />
        ) : (
          <Text style={styles.registerButtonText}>Crear Cuenta</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => router.back()}
        disabled={isSubmitting}
      >
        <Text style={styles.loginLinkText}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: BLACK,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: NEON_GREEN,
  },
  label: {
    fontSize: 16,
    color: NEON_GREEN,
    marginBottom: 5,
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderColor: NEON_GREEN,
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    color: NEON_GREEN,
  },
  registerButton: {
    backgroundColor: NEON_GREEN,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: BLACK,
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
  loginLink: {
    marginTop: 20,
    padding: 10,
  },
  loginLinkText: {
    color: NEON_GREEN,
    textAlign: 'center',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
