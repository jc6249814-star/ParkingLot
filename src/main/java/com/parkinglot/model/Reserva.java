package com.parkinglot.model;

public class Reserva {
    private long id;
    private String cliente;
    private String placa;
    private String espacio;
    private String fecha;
    private String estado;

    public Reserva() {}

    public Reserva(long id, String cliente, String placa, String espacio, String fecha, String estado) {
        this.id = id;
        this.cliente = cliente;
        this.placa = placa;
        this.espacio = espacio;
        this.fecha = fecha;
        this.estado = estado;
    }

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getCliente() { return cliente; }
    public void setCliente(String cliente) { this.cliente = cliente; }

    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }

    public String getEspacio() { return espacio; }
    public void setEspacio(String espacio) { this.espacio = espacio; }

    public String getFecha() { return fecha; }
    public void setFecha(String fecha) { this.fecha = fecha; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}
