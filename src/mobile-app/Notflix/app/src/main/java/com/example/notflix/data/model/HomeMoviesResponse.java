package com.example.notflix.data.model;

import com.google.gson.annotations.SerializedName;

import java.util.List;


public class HomeMoviesResponse {
    public static class CategoryMovies {
        @SerializedName("category")
        private CategoryEntity category;

        @SerializedName("movies")
        private List<MovieEntity> movies;

        // Add getters
        public CategoryEntity getCategory() { return category; }
        public List<MovieEntity> getMovies() { return movies; }
    }

    @SerializedName("moviesByCategory")
    private List<CategoryMovies> categoriesWithMovies;

    @SerializedName("recentlyWatched")
    private List<MovieEntity> recentlyWatched;

    public List<CategoryMovies> getCategoriesWithMovies() { return categoriesWithMovies; }
    public List<MovieEntity> getRecentlyWatched() { return recentlyWatched; }
}
