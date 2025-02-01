package com.example.notflix.data.model;

import com.google.gson.annotations.SerializedName;

import java.util.List;


public class HomeMoviesResponse {
    public static class CategoryMovies {
        @SerializedName("category")
        private CategoryEntity category;

        @SerializedName("movies")
        private List<MovieEntity> movies;

        public CategoryEntity getCategory() { return category; }
        public List<MovieEntity> getMovies() { return movies; }

        public void setCategory(CategoryEntity category) { this.category = category; }
        public void setMovies(List<MovieEntity> movies) { this.movies = movies; }

        @Override
        public String toString() {
            return "CategoryMovies{" +
                    "category=" + category +
                    ", movies=" + movies +
                    '}';
        }
    }

    @SerializedName("moviesByCategory")
    private List<CategoryMovies> moviesByCategory;

    @SerializedName("recentlyWatched")
    private List<MovieEntity> recentlyWatched;

    public List<CategoryMovies> getMoviesByCategory() { return moviesByCategory; }
    public List<MovieEntity> getRecentlyWatched() { return recentlyWatched; }

    @Override
    public String toString() {
        return "HomeMoviesResponse{" +
                "moviesByCategory=" + moviesByCategory +
                ", recentlyWatched=" + recentlyWatched +
                '}';
    }
}
