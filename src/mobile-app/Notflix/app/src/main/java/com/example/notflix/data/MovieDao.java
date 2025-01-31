// MovieDao.java
package com.example.notflix.data;

import androidx.lifecycle.LiveData;
import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;

import com.example.notflix.data.model.MovieEntity;

import java.util.List;

@Dao
public interface MovieDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertMovie(MovieEntity movie);

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertMovies(List<MovieEntity> movies);

    @Query("SELECT * FROM movies WHERE movieId = :movieId")
    LiveData<MovieEntity> getMovieById(String movieId);

    @Query("SELECT * FROM movies")
    LiveData<List<MovieEntity>> getAllMovies();

    @Query("DELETE FROM movies")
    void deleteAllMovies();

    @Query("SELECT * FROM movies WHERE :categoryId IN (categoryIds)") // Corrected query
    LiveData<List<MovieEntity>> getMoviesForCategory(String categoryId);

    @Query("SELECT * FROM movies")
    List<MovieEntity> getAllMoviesSync(); // Synchronous version

//    @Query("SELECT * FROM movies WHERE :categoryId IN (categoryIds)")
//    List<MovieEntity> getMoviesForCategorySync(String categoryId);

    @Query("SELECT * FROM movies WHERE ',' || categoryIds || ',' LIKE '%,' || :categoryId || ',%'")
    List<MovieEntity> getMoviesForCategorySync(String categoryId);
}