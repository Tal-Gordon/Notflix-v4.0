// MovieEntity.java
package com.example.notflix.data.model;

import androidx.annotation.NonNull;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

import com.google.gson.annotations.SerializedName;

import java.util.List;

@Entity(tableName = "movies")
public class MovieEntity {
    @PrimaryKey
    @SerializedName("_id")
    @NonNull private String movieId;

    @NonNull
    private String title;

    private String description;
    private String picture;
    private String video;
    private String actors;
    private String directors;
    @SerializedName("categories")
    private List<String> categoryIds;

    public MovieEntity(@NonNull String movieId,
                       @NonNull String title,
                       String description,
                       String picture,
                       String video,
                       String actors,
                       String directors,
                       List<String> categoryIds) {
        this.movieId = movieId;
        this.title = title;
        this.description = description;
        this.picture = picture;
        this.video = video;
        this.actors = actors;
        this.directors = directors;
        this.categoryIds = categoryIds;
    }

    // Getters
    @NonNull public String getMovieId() { return movieId; }
    @NonNull public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getPicture() { return picture; }
    public String getVideo() { return video; }
    public String getActors() { return actors; }
    public String getDirectors() { return directors; }
    public List<String> getCategoryIds() { return categoryIds; }

    // Setters (if needed for Room)
    public void setMovieId(@NonNull String movieId) { this.movieId = movieId; }
    public void setTitle(@NonNull String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setPicture(String picture) { this.picture = picture; }
    public void setVideo(String video) { this.video = video; }
    public void setActors(String actors) { this.actors = actors; }
    public void setDirectors(String directors) { this.directors = directors; }
    public void setCategoryIds(List<String> categoryIds) { this.categoryIds = categoryIds; }

    @NonNull
    public String toString() {
        return "Movie{" +
                "id='" + movieId + '\'' +
                ", title='" + title + '\'' +
                ", categories=" + categoryIds +
                '}';
    }
}