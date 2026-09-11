package com.parkinglot.model;

public class Usuario {
    private String nombre;
    private String email;
    private String user;
    private String pass;
    private String rol;

    public Usuario() {}

    public Usuario(String nombre, String email, String user, String pass, String rol) {
        this.nombre = nombre;
        this.email = email;
        this.user = user;
        this.pass = pass;
        this.rol = rol;
    }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getUser() { return user; }
    public void setUser(String user) { this.user = user; }
    
    public String getPass() { return pass; }
    public void setPass(String pass) { this.pass = pass; }
    
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
}
