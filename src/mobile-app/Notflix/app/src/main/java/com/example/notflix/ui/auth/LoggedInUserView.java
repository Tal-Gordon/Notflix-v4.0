package com.example.notflix.ui.auth;

/**
 * Class exposing authenticated user details to the UI.
 */
public class LoggedInUserView {
    private final String username;
    public LoggedInUserView(String username) {
        this.username = username;
    }

    public String getUsername() {
        return username;
    }
}