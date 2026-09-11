<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dashboard - Parking Lot</title>
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #f4f7fe; margin: 0; padding: 0; }
        .header { background: white; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .navbar a { text-decoration: none; color: #2b3674; margin-left: 1rem; font-weight: 500; }
        .navbar a.active { color: #4318FF; font-weight: bold; }
        .navbar .logout-btn { background: #e53935; color: white; padding: 8px 16px; border-radius: 8px; margin-left: 1rem; }
        .container { padding: 2rem; }
        .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 2rem; }
    </style>
</head>
<body>
    <header class="header">
        <div class="header-left">
            <h1 class="title" style="margin: 0; color: #2b3674;">Parking Lot</h1>
        </div>
        <nav class="navbar">
            <a href="${pageContext.request.contextPath}/dashboard" class="active">🏠 Inicio</a>
            <a href="${pageContext.request.contextPath}/reserva">🚗 Reservas</a>
            <a href="${pageContext.request.contextPath}/logout" class="logout-btn">🚪 Cerrar sesión</a>
        </nav>
    </header>

    <div class="container">
        <section class="dashboard">
            <h2>Panel de Control</h2>
            <div class="card">
                <h3>Bienvenido, ${sessionScope.usuario.nombre}</h3>
                <p>Tu rol en el sistema es: <strong>${sessionScope.usuario.rol}</strong></p>
                <p>Utiliza el menú de navegación para acceder a las opciones de Reserva.</p>
            </div>
            
            <div style="margin-top: 2rem;">
                <a href="${pageContext.request.contextPath}/reserva" style="background: #4318FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Ir a Gestión de Reservas</a>
            </div>
        </section>
    </div>
</body>
</html>
