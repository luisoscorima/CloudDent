package com.clouddent.dto;

public class LoginResponse {

    private String token;
    private String tipo = "Bearer";
    private long expiraEn;
    private UsuarioResponse usuario;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public long getExpiraEn() {
        return expiraEn;
    }

    public void setExpiraEn(long expiraEn) {
        this.expiraEn = expiraEn;
    }

    public UsuarioResponse getUsuario() {
        return usuario;
    }

    public void setUsuario(UsuarioResponse usuario) {
        this.usuario = usuario;
    }
}
