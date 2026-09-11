<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Login - Parking Lot</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/style.css" />
    <style>
        /* Estilos básicos en caso de no cargar el CSS original */
        body { font-family: 'Inter', sans-serif; background-color: #f4f7fe; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .login-card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); width: 100%; max-width: 400px; text-align: center; }
        .login-card h2 { margin-bottom: 1.5rem; color: #2b3674; }
        .login-card input { width: 100%; padding: 12px; margin-bottom: 1rem; border: 1px solid #e0e5f2; border-radius: 8px; box-sizing: border-box; }
        .login-card button { width: 100%; padding: 12px; background: #4318FF; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
        .login-card button:hover { background: #3311db; }
        .error-msg { color: #e53935; margin-bottom: 1rem; font-size: 0.9rem; }
    </style>
</head>
<body>
    <section id="login-screen" class="active">
        <div class="login-card">
            <h2>Iniciar Sesión</h2>
            <c:if test="${not empty error}">
                <p class="error-msg">${error}</p>
            </c:if>
            <form action="${pageContext.request.contextPath}/login" method="POST">
                <input type="text" name="username" placeholder="Usuario" required />
                <input type="password" name="password" placeholder="Contraseña" required />
                <button type="submit">Ingresar</button>
            </form>
        </div>
    </section>
</body>
</html>
