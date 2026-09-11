package com.parkinglot.controller;

import com.parkinglot.model.Espacio;
import com.parkinglot.model.Reserva;
import com.parkinglot.model.Usuario;
import com.parkinglot.repository.DataStore;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@WebServlet("/reserva")
public class ReservaServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("usuario") == null) {
            response.sendRedirect(request.getContextPath() + "/login");
            return;
        }

        // Obtener solo espacios disponibles para el select del formulario
        List<Espacio> disponibles = DataStore.getInstance().getEspacios().stream()
                .filter(e -> e.getEstado().equals("Disponible"))
                .collect(Collectors.toList());

        request.setAttribute("espaciosDisponibles", disponibles);
        request.setAttribute("reservas", DataStore.getInstance().getReservas());
        request.getRequestDispatcher("/reserva.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("usuario") == null) {
            response.sendRedirect(request.getContextPath() + "/login");
            return;
        }

        Usuario usuario = (Usuario) session.getAttribute("usuario");
        String placa = request.getParameter("placa");
        String espacioId = request.getParameter("espacio");
        String fecha = request.getParameter("fecha");

        if (placa == null || placa.trim().isEmpty() || espacioId == null || espacioId.trim().isEmpty() || fecha == null || fecha.trim().isEmpty()) {
            request.setAttribute("error", "Todos los campos son obligatorios.");
            doGet(request, response);
            return;
        }

        Reserva nuevaReserva = new Reserva();
        nuevaReserva.setCliente(usuario.getUser());
        nuevaReserva.setPlaca(placa.toUpperCase());
        nuevaReserva.setEspacio(espacioId);
        nuevaReserva.setFecha(fecha);

        boolean exito = DataStore.getInstance().agregarReserva(nuevaReserva);

        if (exito) {
            request.setAttribute("mensaje", "Reserva registrada correctamente para el espacio " + espacioId);
        } else {
            request.setAttribute("error", "El espacio seleccionado no está disponible.");
        }
        
        doGet(request, response);
    }
}
