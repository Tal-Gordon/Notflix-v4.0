// MovieDao.java
package com.example.notflix.data.daos;

import androidx.lifecycle.LiveData;
import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;

import com.example.notflix.Entities.Movie;

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

    @Query("SELECT * FROM Movies WHERE :categoryId IN (categoryIds)")
    LiveData<List<Movie>> getMoviesForCategory(String categoryId);

    @Query("SELECT * FROM Movies")
    List<Movie> getAllMoviesSync();

    @Query("SELECT * FROM Movies WHERE :categoryId IN (categoryIds)")
    List<Movie> getMoviesForCategorySync(String categoryId);
}