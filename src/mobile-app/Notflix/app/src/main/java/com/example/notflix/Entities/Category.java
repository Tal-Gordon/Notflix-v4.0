package com.example.notflix.Entities;

import androidx.annotation.NonNull;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

import com.google.gson.annotations.SerializedName;

import java.util.List;

@Entity(tableName = "categories")
public class Category {
    @PrimaryKey
    @SerializedName("_id")
    @NonNull private String categoryId;
    @SerializedName("name")
    private String name;
    @SerializedName("promoted")

    private boolean promoted;
    @SerializedName("movie_list")
    private List<String> movieIds;

    public Category(@NonNull String categoryId,
                    String name,
                    boolean promoted,
                    List<String> movieIds) {
        this.categoryId = categoryId;
        this.name = name;
        this.promoted = promoted;
        this.movieIds = movieIds;
    }

    @NonNull public String getCategoryId() { return categoryId; }
    public String getName() { return name; }
    public boolean isPromoted() { return promoted; }
    public List<String> getMovieIds() { return movieIds; }

    public void setCategoryId(@NonNull String categoryId) { this.categoryId = categoryId; }
    public void setName(String name) { this.name = name; }
    public void setPromoted(boolean promoted) { this.promoted = promoted; }
    public void setMovieIds(List<String> movieIds) { this.movieIds = movieIds; }
    @NonNull
    public String toString() {
        return "Category{" +
                "id='" + categoryId + '\'' +
                ", name='" + name + '\'' +
                ", promoted=" + promoted +
                ", movies=" + movieIds +
                '}';
    }
}