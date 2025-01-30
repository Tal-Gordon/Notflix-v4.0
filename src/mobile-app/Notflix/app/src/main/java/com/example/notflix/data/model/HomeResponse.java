package com.example.notflix.data.model;

import androidx.core.util.Pair;

import com.google.gson.annotations.SerializedName;
import java.util.List;


public class HomeResponse {

    @SerializedName("moviesByCategory")
    private List<Pair<CategoryEntity, List<MovieEntity>>> moviesByCategory;

    @SerializedName("recentlyWatched")
    private List<MovieEntity> recentlyWatched;

    // Constructor
    public HomeResponse(List<Pair<CategoryEntity, List<MovieEntity>>> moviesByCategory, List<MovieEntity> recentlyWatched) {
        this.moviesByCategory = moviesByCategory;
        this.recentlyWatched = recentlyWatched;
    }

    // Getters
    public List<Pair<CategoryEntity, List<MovieEntity>>> getMoviesByCategory() {
        return moviesByCategory;
    }

    public List<MovieEntity> getRecentlyWatched() {
        return recentlyWatched;
    }

    // Setters (if needed)
    public void setMoviesByCategory(List<Pair<CategoryEntity, List<MovieEntity>>> moviesByCategory) {
        this.moviesByCategory = moviesByCategory;
    }

    public void setRecentlyWatched(List<MovieEntity> recentlyWatched) {
        this.recentlyWatched = recentlyWatched;
    }
}
