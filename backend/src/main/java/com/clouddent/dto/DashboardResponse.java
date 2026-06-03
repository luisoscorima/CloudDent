package com.clouddent.dto;

public class DashboardResponse {

    private long totalPacientes;
    private long citasHoy;
    private long citasConfirmadasHoy;

    public long getTotalPacientes() {
        return totalPacientes;
    }

    public void setTotalPacientes(long totalPacientes) {
        this.totalPacientes = totalPacientes;
    }

    public long getCitasHoy() {
        return citasHoy;
    }

    public void setCitasHoy(long citasHoy) {
        this.citasHoy = citasHoy;
    }

    public long getCitasConfirmadasHoy() {
        return citasConfirmadasHoy;
    }

    public void setCitasConfirmadasHoy(long citasConfirmadasHoy) {
        this.citasConfirmadasHoy = citasConfirmadasHoy;
    }
}
