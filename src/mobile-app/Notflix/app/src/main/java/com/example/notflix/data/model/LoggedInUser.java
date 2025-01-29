package com.example.notflix.data.model;

import androidx.annotation.NonNull;

/**
 * Data class that captures user information for logged in users retrieved from LoginRepository
 */
public class LoggedInUser {

    private String token;
    private String username;

    public LoggedInUser(String token, String username) {
        this.token = token;
        this.username = username;
    }

    public String getToken() {
        return token;
    }

    public String getUsername() {
        return username;
    }

    @NonNull
    @Override
    public String toString() {
        return "Username: " + getUsername() + "\nToken: " + getToken();
    }
}