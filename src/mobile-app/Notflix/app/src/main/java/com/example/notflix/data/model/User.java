package com.example.notflix.data.model;

import androidx.annotation.NonNull;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "users")
public class User {
    private String token;
    @PrimaryKey
    @NonNull
    private final String username;

    public User(String token, @NonNull String username) {
        this.token = token;
        this.username = username;
    }

    public String getToken() { return token; }
    public void invalidateToken() { token = null; }

    public boolean isLoggedIn() { return token != null; }
    @NonNull
    public String getUsername() { return username; }
}