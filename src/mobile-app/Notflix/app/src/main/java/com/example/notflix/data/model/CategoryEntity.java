// CategoryEntity.java
package com.example.notflix.data.model;

import androidx.annotation.NonNull;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

import java.util.List;

@Entity(tableName = "categories")
public class CategoryEntity {
    @PrimaryKey
    @NonNull
    private String categoryId;

    private String name;
    private boolean promoted;
    private List<String> movieIds; // List of movie IDs

    public CategoryEntity(@NonNull String categoryId,
                          String name,
                          boolean promoted,
                          List<String> movieIds) {
        this.categoryId = categoryId;
        this.name = name;
        this.promoted = promoted;
        this.movieIds = movieIds;
    }

    // Getters
    @NonNull public String getCategoryId() { return categoryId; }
    public String getName() { return name; }
    public boolean isPromoted() { return promoted; }
    public List<String> getMovieIds() { return movieIds; }

    // Setters
    public void setCategoryId(@NonNull String categoryId) { this.categoryId = categoryId; }
    public void setName(String name) { this.name = name; }
    public void setPromoted(boolean promoted) { this.promoted = promoted; }
    public void setMovieIds(List<String> movieIds) { this.movieIds = movieIds; }
}