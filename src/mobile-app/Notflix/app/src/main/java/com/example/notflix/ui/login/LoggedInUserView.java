package com.example.notflix.ui.login;

/**
 * Class exposing authenticated user details to the UI.
 */
class LoggedInUserView {
    private final String username;
    LoggedInUserView(String username) {
        this.username = username;
    }

    String getUsername() {
        return username;
    }
}