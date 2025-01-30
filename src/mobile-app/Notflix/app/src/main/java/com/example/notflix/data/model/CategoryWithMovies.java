package com.example.notflix.data.model;

import androidx.room.Embedded;
import androidx.room.Junction;
import androidx.room.Relation;
import java.util.List;

public class CategoryWithMovies {
    @Embedded
    public CategoryEntity category;

    @Relation(
            parentColumn = "categoryId",
            entityColumn = "movieId",
            associateBy = @Junction(CategoryMovieJoinEntity.class)
    )
    public List<MovieEntity> movies;

    // Optional constructor
    public CategoryWithMovies(CategoryEntity category, List<MovieEntity> movies) {
        this.category = category;
        this.movies = movies;
    }

    // Getters
    public CategoryEntity getCategory() { return category; }
    public List<MovieEntity> getMovies() { return movies; }
}