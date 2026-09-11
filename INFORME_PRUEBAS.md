# Informe de Pruebas - Parking Lot (Java Web)

**Evidencia:** GA7-220501096-AA2-EV02 - Módulos de software codificados y probados.

A continuación se detallan las pruebas funcionales realizadas sobre los Servlets y JSPs implementados.

### Prueba 1: Carga Inicial de la Aplicación
* **Objetivo:** Verificar que la ruta raíz redirige correctamente a la pantalla de autenticación.
* **Datos utilizados:** Petición `GET /` o al `index.jsp` raíz.
* **Resultado esperado:** Redirección automática HTTP 302 hacia `/login`.
* **Resultado obtenido:** Redirección exitosa a la página de login.
* **Estado:** APROBADO

### Prueba 2: Renderizado del Formulario de Reserva (GET)
* **Objetivo:** Verificar que el formulario de reservas se carga y recibe la lista dinámica de espacios.
* **Datos utilizados:** Petición `GET /reserva` con una sesión activa.
* **Resultado esperado:** Carga de la vista `reserva.jsp` mostrando los espacios con estado "Disponible" (Ej: Espacio A1, A2, etc).
* **Resultado obtenido:** Formulario cargado y opciones desplegables con los espacios correctos.
* **Estado:** APROBADO

### Prueba 3: Registrar una Reserva Exitosa (POST)
* **Objetivo:** Enviar datos correctos para reservar un espacio.
* **Datos utilizados:** Placa `AAA-123`, Espacio `A1`, Fecha `2026-09-10T10:00`.
* **Resultado esperado:** Reserva agregada a la lista en memoria y redirección a `reserva.jsp` con el mensaje: "Reserva registrada correctamente para el espacio A1".
* **Resultado obtenido:** La reserva se procesa y el mensaje de éxito se muestra en pantalla. El estado del espacio pasa a "Reservado".
* **Estado:** APROBADO

### Prueba 4: Enviar formulario de reserva vacío
* **Objetivo:** Validar el backend ante peticiones incompletas.
* **Datos utilizados:** Placa vacía, Espacio nulo, Fecha vacía.
* **Resultado esperado:** El Servlet detecta los campos nulos o vacíos y devuelve el mensaje de error: "Todos los campos son obligatorios."
* **Resultado obtenido:** Redirección al formulario con el mensaje de advertencia y no se guarda ninguna reserva.
* **Estado:** APROBADO

### Prueba 5: Intentar reservar un espacio ocupado (Simulación)
* **Objetivo:** Garantizar que no se pueda reservar un espacio que no está "Disponible".
* **Datos utilizados:** Intento forzado de enviar POST con el Espacio `B3` (Pre-configurado como ocupado/reservado).
* **Resultado esperado:** Mensaje "El espacio seleccionado no está disponible." y se aborta la creación en el DataStore.
* **Resultado obtenido:** Validación correcta en memoria, no se duplican reservas sobre el mismo espacio.
* **Estado:** APROBADO

### Prueba 6: Consultar las reservas activas
* **Objetivo:** Mostrar la tabla de reservas en la misma vista de reserva.
* **Datos utilizados:** Petición `GET /reserva` luego de registrar la reserva.
* **Resultado esperado:** La tabla HTML muestra la reserva creada (Cliente, Placa AAA-123, Espacio A1, Fecha, Estado Activa).
* **Resultado obtenido:** La lista de reservas en memoria se renderiza correctamente mediante el bucle `<c:forEach>`.
* **Estado:** APROBADO

### Prueba 7: Probar sistema de Autenticación (Login)
* **Objetivo:** Verificar que solo los usuarios autorizados puedan ingresar y que se cree la sesión.
* **Datos utilizados:** Usuario `admin`, Clave `admin123`.
* **Resultado esperado:** Validación exitosa contra el DataStore en memoria, creación de objeto de sesión (`HttpSession`), y redirección a `/dashboard`.
* **Resultado obtenido:** Redirección exitosa.
* **Datos alternativos:** Usuario incorrecto `x`, clave `y`.
* **Resultado obtenido alternativo:** Mensaje "Usuario o contraseña incorrectos." en el formulario.
* **Estado:** APROBADO
