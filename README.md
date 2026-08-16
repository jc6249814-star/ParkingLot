# Parking Lot - Sistema Inteligente de Parqueo 🚗

Este proyecto consiste en una aplicación web para la administración y control de un parqueadero inteligente. Permite registrar ingresos y salidas de vehículos, calcular tarifas en tiempo real, agendar reservas y gestionar roles de usuarios.

El proyecto ha sido migrado de una arquitectura puramente frontend con `localStorage` a una arquitectura **Frontend + API REST Backend** con base de datos **SQLite**, como parte de la evidencia del SENA:
**GA7-220501096-AA5-EV04 – API del proyecto**

---

## 🚀 Tecnologías Utilizadas

### Frontend
- **HTML5** & **CSS3** (Diseño premium responsivo con microanimaciones y Chart.js).
- **JavaScript (Vanilla JS)** conectado mediante peticiones asíncronas `fetch` a la API REST.

### Backend
- **Node.js** & **Express.js** para la lógica del servidor y enrutamiento.
- **SQLite3** como motor de base de datos relacional ligero y portable.
- **Bcryptjs** para la encriptación segura de contraseñas de usuarios.
- **JWT (JsonWebToken)** configurado para control de sesiones seguras.
- **CORS** habilitado para permitir solicitudes entre diferentes dominios.
- **Dotenv** para administración segura de variables de entorno.
- **Nodemon** para recargas automáticas durante el desarrollo.

---

## 📂 Estructura del Proyecto

```text
ParkingLot/
├── backend/
│   ├── config/
│   │   └── database.js       # Conexión e inicialización de SQLite
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── spotController.js
│   │   ├── resController.js
│   │   ├── transController.js
│   │   └── statsController.js
│   ├── middleware/
│   │   └── errorMiddleware.js
│   ├── models/
│   │   └── parking.db        # Archivo de base de datos (Autogenerado)
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── spotRoutes.js
│   │   ├── resRoutes.js
│   │   ├── transRoutes.js
│   │   └── statsRoutes.js
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js             # Archivo principal del Backend
├── app.js                    # Controlador Frontend
├── db.js                     # Cliente API de conexión con el Backend
├── index.html                # Interfaz Gráfica
├── style.css                 # Estilos Visuales Premium
├── Parking-Lot-API.postman_collection.json # Pruebas API en Postman
└── README.md                 # Guía y Documentación
```

---

## 🛠️ Instalación y Configuración

### Requisitos Previos
Tener instalado [Node.js](https://nodejs.org/) (versión 16 o superior).

### Paso 1: Configurar el Backend
1. Abre tu terminal e ingresa a la carpeta `backend`:
   ```bash
   cd backend
   ```
2. Instala las dependencias necesarias:
   ```bash
   npm install
   ```
3. Verifica el archivo `.env` en la raíz de la carpeta `backend` con las variables de configuración deseadas:
   ```env
   PORT=3000
   JWT_SECRET=supersecretkeyparkinglot2026
   DB_PATH=./models/parking.db
   ```

### Paso 2: Ejecutar el Proyecto
Para iniciar el servidor Backend en modo desarrollo con nodemon:
```bash
npm run dev
```

El servidor iniciará en http://localhost:3000 y automáticamente generará las tablas SQLite con registros de prueba.

### Paso 3: Abrir el Frontend
El frontend se puede servir directamente desde el puerto del backend ingresando a:
👉 **http://localhost:3000**

También puedes usar extensiones como **Live Server** de VSCode (que habitualmente corre en el puerto 5500) u otro servidor local, ya que la comunicación CORS está completamente habilitada en el backend.

---

## 📡 Tabla de Endpoints de la API REST

A continuación se detallan los endpoints disponibles en la API:

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Registrar un nuevo usuario |
| **POST** | `/api/auth/login` | Iniciar sesión y recibir credenciales |
| **GET** | `/api/usuarios` | Consultar la lista de usuarios |
| **GET** | `/api/usuarios/:id` | Consultar un usuario específico (por ID o Username) |
| **POST** | `/api/usuarios` | Crear un nuevo usuario |
| **PUT** | `/api/usuarios/:id` | Actualizar un usuario existente |
| **DELETE** | `/api/usuarios/:id` | Eliminar un usuario |
| **GET** | `/api/espacios` | Consultar el estado de todos los puestos |
| **GET** | `/api/espacios/:id` | Consultar un puesto específico |
| **POST** | `/api/espacios` | Crear un nuevo puesto de parqueo |
| **PUT** | `/api/espacios/:id` | Modificar estado/información de un puesto |
| **DELETE** | `/api/espacios/:id` | Eliminar un puesto de parqueo |
| **GET** | `/api/reservas` | Consultar la lista de reservas |
| **GET** | `/api/reservas/:id` | Consultar detalle de una reserva |
| **POST** | `/api/reservas` | Agendar una nueva reserva de espacio |
| **PUT** | `/api/reservas/:id` | Modificar datos de una reserva |
| **DELETE** | `/api/reservas/:id` | Cancelar o eliminar una reserva |
| **GET** | `/api/transacciones` | Consultar el historial de cobros realizados |
| **POST** | `/api/transacciones` | Registrar una nueva transacción |
| **PUT** | `/api/transacciones/:id` | Modificar datos de cobro |
| **DELETE** | `/api/transacciones/:id` | Eliminar registro de transacción |
| **GET** | `/api/estadisticas` | Obtener métricas y datos útiles para el Dashboard |

---

## 🧪 Pruebas en Postman

El proyecto incluye el archivo `Parking-Lot-API.postman_collection.json`. 
Para probar la API:
1. Abre **Postman**.
2. Presiona el botón **Import** (Importar) en la esquina superior izquierda.
3. Arrastra o selecciona el archivo `Parking-Lot-API.postman_collection.json`.
4. ¡Listo! Tendrás todas las peticiones organizadas por carpetas y listas para ejecutar con un solo clic.

---

## 🛠️ Credenciales por Defecto (Base de Datos Inicial)

Al iniciar el sistema por primera vez, se crean automáticamente las siguientes cuentas de prueba:

- **Administrador**:
  - Usuario: `admin`
  - Contraseña: `admin123`
- **Operador**:
  - Usuario: `operador`
  - Contraseña: `operador123`
- **Cliente**:
  - Usuario: `carlos`
  - Contraseña: `carlos123`
