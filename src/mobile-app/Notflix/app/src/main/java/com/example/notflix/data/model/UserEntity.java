package com.example.notflix.data.model;

import androidx.annotation.NonNull;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "users")
public class UserEntity {
    @PrimaryKey
    @NonNull
    private String userId;
    private String displayName;

    public UserEntity(String userId, String displayName) {
        this.userId = userId;
        this.displayName = displayName;
    }

    // Getters
    public String getUserId() { return userId; }
    public String getDisplayName() { return displayName; }
}