// MovieDao.java
package com.example.notflix.data;

import androidx.lifecycle.LiveData;
import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;

import com.example.notflix.data.model.Movie;

import java.util.List;

@Dao
public interface MovieDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertMovie(Movie movie);

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertMovies(List<Movie> movies);

    @Query("SELECT * FROM Movies WHERE movieId = :movieId")
    LiveData<Movie> getMovieById(String movieId);

    @Query("SELECT * FROM Movies")
    LiveData<List<Movie>> getAllMovies();

    @Query("DELETE FROM Movies")
    void deleteAllMovies();

    @Query("SELECT * FROM Movies WHERE :categoryId IN (categoryIds)") // Corrected query
    LiveData<List<Movie>> getMoviesForCategory(String categoryId);

    @Query("SELECT * FROM Movies")
    List<Movie> getAllMoviesSync(); // Synchronous version

//    @Query("SELECT * FROM movies WHERE movieId IN (SELECT movieId FROM Category WHERE categoryId = :categoryId)")
//    List<Movie> getMoviesForCategorySync(String categoryId);

    @Query("SELECT * FROM Movies WHERE :categoryId IN (categoryIds)")
    List<Movie> getMoviesForCategorySync(String categoryId);

//    @Query("SELECT * FROM movies WHERE ',' || categoryIds || ',' LIKE '%,' || :categoryId || ',%'")
//    List<Movie> getMoviesForCategorySync(String categoryId);
}