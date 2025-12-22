# Evaluación 3 - Desarrollo Móvil — TODO List

Aplicación de lista de tareas (TODO) desarrollada con React Native + Expo y TypeScript que se conecta a una API backend externa. Implementa gestión completa de tareas con captura de fotos, ubicación GPS, edición de tareas y autenticación de usuarios.
Proyecto creado como parte de la Evaluación 3 del curso de Desarrollo de Aplicaciones Móviles.

# Video Explicativo

- [Ver video explicativo en YouTube](https://youtu.be/StnTmLiDNwM?si=4MjswExMO4bPt1Fw)


## Características

- **Autenticación con API backend**: Login y registro de nuevos usuarios contra servidor externo con JWT.
- **Gestión completa de tareas**: Crear, editar, completar y eliminar tareas.
- **Captura de fotos**: Tomar fotos con la cámara del dispositivo e incluirlas en las tareas.
- **Ubicación GPS**: Capturar coordenadas de ubicación automáticamente al tomar fotos.
- **Visor de tareas**: Mostrar fotos y coordenadas de ubicación en la lista de tareas.
- **Edición de tareas**: Modificar el título de tareas existentes mediante modal dedicado.
- **Perfil de usuario**: Resumen de tareas totales, completadas y pendientes.
- **Interfaz con navegación por pestañas** (tabs): Tareas y Perfil.
- **Persistencia de sesión**: Mantiene el usuario logueado entre sesiones.
- **Manejo robusto de errores HTTP**: Mensajes en español para 400-401-403-404-409-422-500-502-503-504, con validación previa (email, contraseña 6+) y logs diferenciados (warn para validación, info para éxito).
- **Context API** para gestión de estado de autenticación.
- **Componentes reutilizables** y hooks personalizados.
- **Cliente HTTP con Axios** para comunicación con la API externa.
- **Integración con API externa**: https://todo-list.dobleb.cl

## Credenciales de prueba

Para acceder a la aplicación, utiliza la opción de **"Registrate"** directamente desde la pantalla de login para crear una nueva cuenta con el siguiente formato:

```
Email: usuario@ejemplo.com
Contraseña: mínimo 6 caracteres
```

O usa credenciales existentes si ya las tienes registradas en el sistema.

## Tecnologías

- **Expo** (React Native)
- **React** 19.1.0
- **TypeScript** (strict mode)
- **Axios** (cliente HTTP para la API)
- **Axios interceptors + manejo de errores** (ApiError + mapping de códigos HTTP)
- **Context API** (gestión de estado)
- **React Router** (expo-router v6)
- **AsyncStorage** (persistencia de sesión)
- **jose** (decodificación de JWT)
- **expo-image-picker** (captura de fotos)
- **expo-location** (coordenadas GPS)
- **expo-module-scripts** (soporte de tsconfig en módulos Expo)
- **FontAwesome Icons** (interfaz visual)

## Requisitos

- Node.js (14+ recomendado)
- npm o yarn
- Opcional: Expo CLI (`npm install -g expo-cli`)

## Configuración de Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
EXPO_PUBLIC_API_URL=https://todo-list.dobleb.cl
```

Esta variable define la URL base de la API backend externa.

## Instalación y ejecución

1. **Instala dependencias**:

```powershell
npm install
```

2. **Inicia la aplicación**:

```powershell
npx expo start
```

3. **Escanea el código QR** con la app Expo Go o abre en emulador/dispositivo.

## Funcionalidades Principales

### Autenticación
- Login con email y contraseña
- Registro de nuevos usuarios
- Persistencia automática de sesión
- Cierre de sesión (logout)
 - Validación local de email y contraseña (6+ caracteres) antes de llamar a la API
 - Si el usuario no existe, regístrate primero desde la app

### Gestión de Tareas
- Crear tareas con título, foto y ubicación
- Editar título de tareas existentes
- Marcar tareas como completadas/pendientes
- Eliminar tareas
- Ver tareas activas y completadas
- Mostrar contador de tareas

### Manejo de errores y validaciones
- Mensajes claros en español para códigos 400, 401, 403, 404, 409, 422, 500, 502, 503, 504
- Validación previa en cliente (email válido, contraseña mínima de 6) para evitar llamadas inválidas
- Logs diferenciados: advertencias para validaciones, info para éxito
- Tiempo de espera de 10s en peticiones HTTP

### Perfil de Usuario
- Ver email del usuario logueado
- Resumen de tareas (total, completadas, pendientes)

### Captura Multimedia
- Botón para capturar fotos con la cámara
- Obtención automática de ubicación GPS después de capturar
- Vista previa de foto antes de crear/editar
- Visualización de fotos en la lista de tareas
- Mostrar coordenadas de ubicación (latitud, longitud)

## Estructura principal del proyecto

```
app/                # Pantallas y navegación (Expo Router)
    _layout.tsx
    index.tsx         # Login
    register.tsx      # Registro
    modal.tsx         # Crear tarea (foto+ubicación)
    edit-modal.tsx    # Editar tarea
    (tabs)/           # Tabs: tareas y perfil

components/         # UI y utilidades
    TodoForm.tsx
    TodoItem.tsx
    context/auth-context.tsx

services/           # Clientes HTTP
    auth-services.ts
    todo-services.ts

hooks/
    useTodos.ts

utils/
    error-handler.ts

constants/
    auth.ts
    config.ts

assets/
    images/

package.json
tsconfig.json
.env.local (local)
README.md
```

## Endpoints de la API

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar nuevo usuario

### Tareas
- `GET /todos` - Obtener lista de tareas
- `POST /todos` - Crear nueva tarea
- `PATCH /todos/:id` - Actualizar tarea
- `DELETE /todos/:id` - Eliminar tarea

## Demostración del uso de la API

A continuación se mostraran algunas capturas del consumo de los diferentes endpoints de la api en la 
plataforma de Swagger, junto con sus resultados en nuestra aplicación propiamente tal. Para ello se
utilizaron las siguiente credenciales: usuario: probando@mail.com  contraseña: password123

![Metodo get](/assets/images/get-pc.png)


Aquí podemos apreciar el uso del método GET del endpoint /todos, el cual fue correctamente ejecutado y nos dio como respuesta
una sola tarea que es la que teníamos hasta ese momento luego de grabar el vídeo.

<img src="/assets/images/get-cel.jpeg" width="450px" height="750px">

Esta es la única tarea que había hasta ese momento, vista desde la aplicación misma

Ahora, en la siguiente imagen podemos ver el llamado al método POST en /todos también para crear una nueva tarea desde el mismo Swagger.
Esta tarea fue generada con una imagen sacada de internet al igual que la anterior y nos podemos dar cuenta fácilmente de que la respuesta 
fue éxitosa (201), que se le asignó su ID y se registró la fecha y hora de la creación.

![Metodo post](/assets/images/post-pc.png)

A continuación, en la siguiente imagen, se verá el resultado de la creación de esta nueva tarea pero ahora desde la
vista de la misma aplicación, podemos fijarnos de que el nombre es el mismo que en Swagger y si somos más
meticulosos, podemos además copiar la url de la imagen, abrirla en nuestro navegador y cerciorarnos de que ambas
coinciden.

<img src="/assets/images/post-cel.jpeg" width="450px" height="750px">


Ahora continuamos con la demostración del método PATCH, el cual en este caso lo usamos para actualizar el título
de la tarea. Dentro de nuestra misma app este método se utiliza para actualizar el mismo título como tal o 
también el estado de ésta, entre pendiente y completada.

![Metodo patch](/assets/images/patch-pc.png)

Y en la siguiente imagen podemos apreciar desde dentro de nuestra aplicación que el título de la tarea
se actualizó correctamente, no solo por ver que coinciden, sino que además porque en la plataforma Swagger
la respuesta a la petición fue exitosa.

<img src="/assets/images/patch-cel.jpeg" width="450px" height="750px">


Por último, dentro de esta pequeña demostración le dimos cabida al consumo o uso del método DELETE, para el cual
creamos especialmente esta nueva tarea. Para ello requerimos ingresar el ID de la tarea correspondiente a eliminar,
al igual que lo hicimos con el método PATCH.

![Metodo get para delete](/assets/images/delete1-pc.png)
(Aquí se ven los datos de la nueva tarea que creamos para eliminar)

<img src="/assets/images/delete1-cel.jpeg" width="450px" height="750px">
(Y aquí podemos observar la tarea dentro de la app previo a ser eliminada)

![Metodo delete](/assets/images/delet2-pc.png)
(En esta imagen vemos que colocamos el id correspondiente a la tarea mencionada, y que la respuesta a la petición fue exitosa)

<img src="/assets/images/delete2-cel.jpeg" width="450px" height="750px">
(Finalmente, luego del consumo de este método, la app vuelve a estar igual solo con sus dos tareas previas)

Esta fue una pequeña demostración con algunos endpoints del uso y conexión entre la API y nuestra propia Aplicación, pero esta vez desde un
punto de vista inverso por decirlo así, ya que las peticiones se realizaron desde Swagger y se reflejaron en la vista de la app.
De igual manera, si gustan son libres de probar su funcionamiento desde la misma aplicación y verán que los resultados se veran
reflejados igualmente, para ello solo deberán autenticarse con las credenciales indicadas más arriba, obtener así el Token
y ya solo les quedaría ir probando cada endpoint.

## Uso de IA

Durante el desarrollo se utilizó **GitHub Copilot** como herramienta de apoyo para:
- Identificar y solucionar errores de compilación
- Proponer snippets de código y completar funciones
- Optimizar la estructura del proyecto
- Generar comentarios y documentación

Todas las sugerencias de Copilot fueron **revisadas y validadas manualmente** antes de incorporarlas al proyecto.

## Licencia

Este proyecto es de **uso académico exclusivamente**. Está estrictamente prohibido su uso para fines comerciales sin autorización.

## Autores

Miembros del equipo de desarrollo:
- Luciano Lopresti - Desarrollo
- Sebastián Masferrer - Desarrollo
- Víctor Mella - Desarrollo
- Loretto Herrera - Desarrollo
