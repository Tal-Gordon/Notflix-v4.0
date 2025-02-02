package com.example.notflix.data.model.response;

import com.google.gson.annotations.SerializedName;

public class AuthResponse {
    @SerializedName("token")
    private String token;

    public String getToken() {
        return token;
    }
}