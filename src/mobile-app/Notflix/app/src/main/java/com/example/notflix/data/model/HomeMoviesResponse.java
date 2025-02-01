package com.example.notflix.data.model;

import com.google.gson.annotations.SerializedName;

import java.util.List;


public class HomeMoviesResponse {
    public static class CategoryMovies {
        @SerializedName("category")
        private Category category;

        @SerializedName("movies")
        private List<Movie> movies;

        public Category getCategory() { return category; }
        public List<Movie> getMovies() { return movies; }

        public void setCategory(Category category) { this.category = category; }
        public void setMovies(List<Movie> movies) { this.movies = movies; }

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
    private List<Movie> recentlyWatched;

    public List<CategoryMovies> getMoviesByCategory() { return moviesByCategory; }
    public List<Movie> getRecentlyWatched() { return recentlyWatched; }

    @Override
    public String toString() {
        return "HomeMoviesResponse{" +
                "moviesByCategory=" + moviesByCategory +
                ", recentlyWatched=" + recentlyWatched +
                '}';
    }
}
