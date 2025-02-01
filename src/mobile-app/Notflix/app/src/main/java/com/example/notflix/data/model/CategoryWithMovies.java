package com.example.notflix.data.model;

import androidx.room.Embedded;
import androidx.room.Junction;
import androidx.room.Relation;
import java.util.List;

public class CategoryWithMovies {
    @Embedded
    public Category category;

    @Relation(
            parentColumn = "categoryId",
            entityColumn = "movieId",
            associateBy = @Junction(CategoryMovieJoinEntity.class)
    )
    public List<Movie> movies;

    // Optional constructor
    public CategoryWithMovies(Category category, List<Movie> movies) {
        this.category = category;
        this.movies = movies;
    }

    // Getters
    public Category getCategory() { return category; }
    public List<Movie> getMovies() { return movies; }
}