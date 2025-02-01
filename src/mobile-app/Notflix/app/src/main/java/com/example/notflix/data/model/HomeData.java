package com.example.notflix.data.model;

import java.util.List;
import java.util.Map;

public class HomeData {
    private List<CategoryEntity> categories;
    private Map<String, List<MovieEntity>> moviesByCategory;

    public HomeData(List<CategoryEntity> categories, Map<String, List<MovieEntity>> moviesByCategory) {
        this.categories = categories;
        this.moviesByCategory = moviesByCategory;
    }

    public void setCategories(List<CategoryEntity> categories) {
        this.categories = categories;
    }

    public void setMoviesByCategory(Map<String, List<MovieEntity>> moviesByCategory) {
        this.moviesByCategory = moviesByCategory;
    }

    public List<CategoryEntity> getCategories() { return categories; }
    public Map<String, List<MovieEntity>> getMoviesByCategory() { return moviesByCategory; }
}
