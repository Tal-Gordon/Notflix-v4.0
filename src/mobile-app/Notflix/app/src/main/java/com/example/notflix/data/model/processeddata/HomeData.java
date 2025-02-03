package com.example.notflix.data.model.processeddata;

import com.example.notflix.Entities.Category;
import com.example.notflix.Entities.Movie;

import java.util.List;
import java.util.Map;

public class HomeData {
    private List<Category> categories;
    private Map<String, List<Movie>> moviesByCategory;

    public HomeData(List<Category> categories, Map<String, List<Movie>> moviesByCategory) {
        this.categories = categories;
        this.moviesByCategory = moviesByCategory;
    }

    public void setCategories(List<Category> categories) {
        this.categories = categories;
    }

    public void setMoviesByCategory(Map<String, List<Movie>> moviesByCategory) {
        this.moviesByCategory = moviesByCategory;
    }

    public List<Category> getCategories() { return categories; }
    public Map<String, List<Movie>> getMoviesByCategory() { return moviesByCategory; }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("HomeData{\n");

        sb.append("  categories=[\n");
        if (categories != null) {
            for (Category category : categories) {
                sb.append("    ").append(category.toString().replace("\n", "\n    ")).append("\n"); // Indent category toString
            }
        }
        sb.append("  ],\n");


        sb.append("  moviesByCategory=[\n");
        if (moviesByCategory != null) {
            for (Map.Entry<String, List<Movie>> entry : moviesByCategory.entrySet()) {
                String categoryName = entry.getKey();
                List<Movie> movies = entry.getValue();

                sb.append("    ").append(categoryName).append("=[\n");  // Category Name
                if (movies != null) {
                    for (Movie movie : movies) {
                        sb.append("      ").append(movie.toString().replace("\n", "\n      ")).append("\n"); // Indent movie toString
                    }
                }
                sb.append("    ],\n");
            }
        }
        sb.append("  ]\n");

        sb.append("}");
        return sb.toString();
    }
}
