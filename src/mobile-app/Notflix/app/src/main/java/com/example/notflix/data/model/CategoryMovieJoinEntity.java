package com.example.notflix.data.model;

import androidx.room.Entity;
import androidx.room.ForeignKey;
import androidx.room.Index;

@Entity(
        tableName = "category_movie_join",
        primaryKeys = {"categoryId", "movieId"},
        indices = {
                @Index("categoryId"),
                @Index("movieId")
        },
        foreignKeys = {
                @ForeignKey(
                        entity = Category.class,
                        parentColumns = "categoryId",
                        childColumns = "categoryId",
                        onDelete = ForeignKey.CASCADE
                ),
                @ForeignKey(
                        entity = Movie.class,
                        parentColumns = "movieId",
                        childColumns = "movieId",
                        onDelete = ForeignKey.CASCADE
                )
        }
)
public class CategoryMovieJoinEntity {
    public final String categoryId;
    public final String movieId;

    public CategoryMovieJoinEntity(String categoryId, String movieId) {
        this.categoryId = categoryId;
        this.movieId = movieId;
    }
}