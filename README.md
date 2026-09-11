# Parking Lot - Java Web (Servlets & JSP)

## Descripción
Sistema web para la gestión de un parqueadero. Esta versión ha sido migrada de Node.js a una arquitectura Java Web utilizando Servlets y JSP para cumplir con la evidencia GA7-220501096-AA2-EV02 del SENA.

## Tecnologías
* Java 17
* Jakarta Servlets API 6.0
* JSP (Jakarta Server Pages) y JSTL
* HTML5, CSS3
* Maven
* Apache Tomcat (v10+)
* Git / GitHub

## Módulos Migrados
* **Login**: Autenticación simulada mediante Servlet y validación de sesión.
* **Reservas**: Creación y consulta de reservas utilizando el patrón MVC (JSP -> Servlet -> Modelo).

## Arquitectura (MVC)
* **Model**: Clases Java (`Usuario`, `Reserva`, `Espacio`) que representan los datos.
* **View**: Archivos JSP (`login.jsp`, `dashboard.jsp`, `reserva.jsp`) que construyen la interfaz del usuario.
* **Controller**: Clases Servlets (`LoginServlet`, `ReservaServlet`) que reciben peticiones GET/POST, validan y procesan la lógica.
* **Repository**: Se utiliza `DataStore.java` como una base de datos en memoria (Singleton) simulando la persistencia temporal de los datos.

## Instalación y Ejecución

1. Clonar el repositorio.
2. Abrir el proyecto en un IDE compatible con Java Web y Maven (IntelliJ IDEA Ultimate, Eclipse Enterprise, o VS Code con extensiones de Java).
3. Asegurarse de tener configurado Apache Tomcat 10 o superior (compatible con Jakarta EE 10 / Servlet 6).
4. Ejecutar el proyecto (`Run on Server` o empaquetar con `mvn clean package` y desplegar el archivo `.war` en Tomcat).
5. Acceder a la ruta local configurada, por ejemplo: `http://localhost:8080/parkinglot-web`

**Credenciales por defecto:**
* Usuario: `admin` | Clave: `admin123`
* Usuario: `carlos` | Clave: `carlos123`

## Pruebas
Revisar el archivo `INFORME_PRUEBAS.md` para ver el detalle de los casos de prueba ejecutados según lo requerido en la evidencia.
