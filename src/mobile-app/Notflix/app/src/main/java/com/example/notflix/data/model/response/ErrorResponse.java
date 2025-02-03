package com.example.notflix.data.model.response;

public class ErrorResponse {
    private String error;
    private int status_code;

    public String getError() {
        return error;
    }

    public int getStatusCode() {
        return status_code;
    }
}