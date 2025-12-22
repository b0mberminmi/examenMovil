import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getCurrentUser, isValidEmail } from '../constants/auth';
import { useAuth } from '../components/context/auth-context';
import useTodos from '../hooks/useTodos'; // Uso del hook en vez del service

export default function LoginScreen() {
  const router = useRouter();
  const { login, user } = useAuth();
  const token = user?.token;
  const { reload, error } = useTodos(token); // Consumir el hook

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoadingTodos, setIsLoadingTodos] = useState(false);

  // Restaurar sesión si ya hay un usuario autenticado
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const storedUser = await getCurrentUser();
        if (storedUser && storedUser.token && isMounted) {
          router.replace('/(tabs)/todos');
          return;
        }
      } catch (restoreError) {
        console.error('Error restaurando la sesión:', restoreError);
      } finally {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Cargar tareas cuando el usuario inicia sesión
  useEffect(() => {
    const loadTodos = async () => {
      if (user && !isCheckingSession) {
        setIsLoadingTodos(true);
        try {
          await reload(); // Uso del hook para recargar tareas
          router.replace('/(tabs)/todos');
        } catch (err) {
          console.error('Error al cargar tareas:', err);
          Alert.alert('Error', 'No se pudieron cargar las tareas. Intenta nuevamente.');
          router.replace('/(tabs)/todos');
        } finally {
          setIsLoadingTodos(false);
        }
      }
    };

    loadTodos();
  }, [user, isCheckingSession, reload, router]);

  const handleLogin = async () => {
    setErrorMsg('');

    if (!isValidEmail(email)) {
      setErrorMsg('Ingresa un email válido.');
      return;
    }

    if (!password) {
      setErrorMsg('Ingresa tu contraseña.');
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await login(email.trim(), password.trim());

      if (!success) {
        setErrorMsg('Credenciales incorrectas.');
        return;
      }

      router.replace('/(tabs)/todos');
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setErrorMsg((err as Error).message || 'No se pudo iniciar sesión. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingSession || isLoadingTodos) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#00ff00" size="large" />
        <Text style={styles.loadingText}>
          {isLoadingTodos ? 'Cargando tareas...' : 'Cargando sesión...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#006600"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="********"
        placeholderTextColor="#006600"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[
          styles.loginButton,
          { opacity: !email || !password || isSubmitting ? 0.5 : 1 },
        ]}
        disabled={!email || !password || isSubmitting}
        onPress={handleLogin}
      >
        <Text style={styles.loginButtonText}>
          {isSubmitting ? 'Verificando...' : 'Iniciar Sesión'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.registerLink}
        onPress={() => router.push('/register')}
        disabled={isSubmitting}
      >
        <Text style={styles.registerLinkText}>¿No tienes cuenta? Registrate</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  loadingText: {
    color: '#00ff00',
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#00ff00',
  },
  label: {
    fontSize: 16,
    color: '#00ff00',
    marginBottom: 5,
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderColor: '#00ff00',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    color: '#00ff00',
  },
  loginButton: {
    backgroundColor: '#00ff00',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
  registerLink: {
    marginTop: 20,
    padding: 10,
  },
  registerLinkText: {
    color: '#00ff00',
    textAlign: 'center',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
