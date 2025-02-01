package com.example.notflix.ui.auth;

import com.example.notflix.data.model.LoggedInUser;

/**
 * Class exposing authenticated user details to the UI.
 */
public class LoggedInUserView {
    private final String token;
    private final String username;

    public LoggedInUserView(String token, String username) {
        this.token = token;
        this.username = username;
    }

    public LoggedInUserView(LoggedInUser loggedInUser) {
        this.token = loggedInUser.getToken();
        this.username = loggedInUser.getUsername();
    }

    public String getToken() {
        return token;
    }

    public String getUsername() {
        return username;
    }

}