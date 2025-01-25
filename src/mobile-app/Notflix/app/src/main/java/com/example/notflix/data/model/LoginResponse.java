package com.example.notflix.data.model;

import com.google.gson.annotations.SerializedName;

public class LoginResponse {
    @SerializedName("id") // Use if JSON key differs
    private String userId;

    public String getUserId() {
        return userId;
    }
}