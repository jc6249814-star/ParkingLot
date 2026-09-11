package com.parkinglot.model;

public class Espacio {
    private String id;
    private String zona;
    private int numero;
    private String estado;
    private String vehiculoPlaca;
    private String clienteReserva;

    public Espacio() {}

    public Espacio(String id, String zona, int numero, String estado) {
        this.id = id;
        this.zona = zona;
        this.numero = numero;
        this.estado = estado;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getZona() { return zona; }
    public void setZona(String zona) { this.zona = zona; }

    public int getNumero() { return numero; }
    public void setNumero(int numero) { this.numero = numero; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getVehiculoPlaca() { return vehiculoPlaca; }
    public void setVehiculoPlaca(String vehiculoPlaca) { this.vehiculoPlaca = vehiculoPlaca; }

    public String getClienteReserva() { return clienteReserva; }
    public void setClienteReserva(String clienteReserva) { this.clienteReserva = clienteReserva; }
}
