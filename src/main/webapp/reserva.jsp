<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reservas - Parking Lot</title>
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #f4f7fe; margin: 0; padding: 0; }
        .header { background: white; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .navbar a { text-decoration: none; color: #2b3674; margin-left: 1rem; font-weight: 500; }
        .navbar a.active { color: #4318FF; font-weight: bold; }
        .navbar .logout-btn { background: #e53935; color: white; padding: 8px 16px; border-radius: 8px; margin-left: 1rem; }
        .container { padding: 2rem; display: flex; gap: 2rem; flex-wrap: wrap; }
        .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); flex: 1; min-width: 300px; }
        .card h3 { color: #2b3674; margin-top: 0; }
        .form-group { margin-bottom: 1rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: bold; color: #2b3674; }
        .form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #e0e5f2; border-radius: 8px; box-sizing: border-box; }
        .btn-primary { background: #4318FF; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; width: 100%; }
        .btn-primary:hover { background: #3311db; }
        .alert-success { background: #4caf50; color: white; padding: 10px; border-radius: 8px; margin-bottom: 1rem; }
        .alert-error { background: #e53935; color: white; padding: 10px; border-radius: 8px; margin-bottom: 1rem; }
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e0e5f2; }
        th { color: #a3aed1; font-weight: bold; text-transform: uppercase; font-size: 0.85rem; }
        td { color: #2b3674; font-weight: 500; }
    </style>
</head>
<body>
    <header class="header">
        <div class="header-left">
            <h1 class="title" style="margin: 0; color: #2b3674;">Parking Lot</h1>
        </div>
        <nav class="navbar">
            <a href="${pageContext.request.contextPath}/dashboard">🏠 Inicio</a>
            <a href="${pageContext.request.contextPath}/reserva" class="active">🚗 Reservas</a>
            <a href="${pageContext.request.contextPath}/logout" class="logout-btn">🚪 Cerrar sesión</a>
        </nav>
    </header>

    <div class="container">
        <!-- Formulario de Reserva -->
        <div class="card">
            <h3>Registrar Nueva Reserva</h3>
            
            <c:if test="${not empty mensaje}">
                <div class="alert-success">${mensaje}</div>
            </c:if>
            <c:if test="${not empty error}">
                <div class="alert-error">${error}</div>
            </c:if>

            <form action="${pageContext.request.contextPath}/reserva" method="POST">
                <div class="form-group">
                    <label for="placa">Placa del Vehículo:</label>
                    <input type="text" id="placa" name="placa" placeholder="ABC-123" required />
                </div>
                
                <div class="form-group">
                    <label for="espacio">Seleccionar Espacio:</label>
                    <select id="espacio" name="espacio" required>
                        <option value="">-- Seleccione un espacio --</option>
                        <c:forEach var="esp" items="${espaciosDisponibles}">
                            <option value="${esp.id}">Espacio ${esp.id} (Zona ${esp.zona})</option>
                        </c:forEach>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="fecha">Fecha y Hora:</label>
                    <input type="datetime-local" id="fecha" name="fecha" required />
                </div>
                
                <button type="submit" class="btn-primary">Registrar Reserva</button>
            </form>
        </div>

        <!-- Lista de Reservas -->
        <div class="card">
            <h3>Reservas Activas</h3>
            <c:choose>
                <c:when test="${empty reservas}">
                    <p>No hay reservas activas en este momento.</p>
                </c:when>
                <c:otherwise>
                    <table>
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Placa</th>
                                <th>Espacio</th>
                                <th>Fecha</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            <c:forEach var="res" items="${reservas}">
                                <tr>
                                    <td>${res.cliente}</td>
                                    <td>${res.placa}</td>
                                    <td>${res.espacio}</td>
                                    <td>${res.fecha}</td>
                                    <td><span style="background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">${res.estado}</span></td>
                                </tr>
                            </c:forEach>
                        </tbody>
                    </table>
                </c:otherwise>
            </c:choose>
        </div>
    </div>
</body>
</html>
