package com.example.notflix.data.model;

import java.util.HashMap;
import java.util.Map;

import okhttp3.MultipartBody;
import okhttp3.RequestBody;

public class SignupRequest {
    private final String username;
    private final String password;
    private final String name;
    private final String surname;

    public SignupRequest(String username, String password, String name, String surname) {
        this.username = username;
        this.password = password;
        this.name = name;
        this.surname = surname;
    }

    public Map<String, RequestBody> toPartMap() {
        Map<String, RequestBody> parts = new HashMap<>();
        parts.put("username", toRequestBody(username));
        parts.put("password", toRequestBody(password));
        if (name != null) parts.put("name", toRequestBody(name));
        if (surname != null) parts.put("surname", toRequestBody(surname));
        return parts;
    }

    private RequestBody toRequestBody(String value) {
        return RequestBody.create(MultipartBody.FORM, value);
    }
}