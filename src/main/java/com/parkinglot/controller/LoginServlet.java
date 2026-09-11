package com.parkinglot.controller;

import com.parkinglot.model.Usuario;
import com.parkinglot.repository.DataStore;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.util.Optional;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.getRequestDispatcher("/login.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String user = request.getParameter("username");
        String pass = request.getParameter("password");

        if (user == null || user.trim().isEmpty() || pass == null || pass.trim().isEmpty()) {
            request.setAttribute("error", "Los campos no pueden estar vacíos.");
            request.getRequestDispatcher("/login.jsp").forward(request, response);
            return;
        }

        Optional<Usuario> authUser = DataStore.getInstance().autenticar(user, pass);

        if (authUser.isPresent()) {
            HttpSession session = request.getSession();
            session.setAttribute("usuario", authUser.get());
            response.sendRedirect(request.getContextPath() + "/dashboard");
        } else {
            request.setAttribute("error", "Usuario o contraseña incorrectos.");
            request.getRequestDispatcher("/login.jsp").forward(request, response);
        }
    }
}
