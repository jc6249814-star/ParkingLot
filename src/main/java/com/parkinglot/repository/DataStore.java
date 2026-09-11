package com.parkinglot.repository;

import com.parkinglot.model.Espacio;
import com.parkinglot.model.Reserva;
import com.parkinglot.model.Usuario;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class DataStore {
    private static DataStore instance;
    private List<Usuario> usuarios;
    private List<Espacio> espacios;
    private List<Reserva> reservas;

    private DataStore() {
        usuarios = new ArrayList<>();
        espacios = new ArrayList<>();
        reservas = new ArrayList<>();
        initDefaultData();
    }

    public static synchronized DataStore getInstance() {
        if (instance == null) {
            instance = new DataStore();
        }
        return instance;
    }

    private void initDefaultData() {
        // Usuarios por defecto
        usuarios.add(new Usuario("Jenniffer Castañeda", "jenniffer@sena.edu.co", "admin", "admin123", "Administrador"));
        usuarios.add(new Usuario("Carlos Restrepo", "carlos@gmail.com", "carlos", "carlos123", "Cliente"));

        // Espacios
        String[] zonas = {"A", "B", "C"};
        for (String zona : zonas) {
            for (int i = 1; i <= 10; i++) {
                String id = zona + i;
                espacios.add(new Espacio(id, zona, i, "Disponible"));
            }
        }
    }

    public List<Usuario> getUsuarios() { return usuarios; }
    public List<Espacio> getEspacios() { return espacios; }
    public List<Reserva> getReservas() { return reservas; }

    public Optional<Usuario> autenticar(String user, String pass) {
        return usuarios.stream()
            .filter(u -> u.getUser().equals(user) && u.getPass().equals(pass))
            .findFirst();
    }

    public Optional<Espacio> buscarEspacio(String id) {
        return espacios.stream().filter(e -> e.getId().equals(id)).findFirst();
    }

    public boolean agregarReserva(Reserva reserva) {
        Optional<Espacio> esp = buscarEspacio(reserva.getEspacio());
        if (esp.isPresent() && esp.get().getEstado().equals("Disponible")) {
            esp.get().setEstado("Reservado");
            esp.get().setVehiculoPlaca(reserva.getPlaca());
            esp.get().setClienteReserva(reserva.getCliente());
            reserva.setId(System.currentTimeMillis());
            reserva.setEstado("Activa");
            reservas.add(reserva);
            return true;
        }
        return false;
    }
}
