package com.example.notflix.data;

import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;
import com.example.notflix.data.model.CategoryMovieJoinEntity;
import java.util.List;

@Dao
public interface CategoryMovieJoinDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertCategoryMovieJoin(CategoryMovieJoinEntity join);

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertCategoryMovieJoins(List<CategoryMovieJoinEntity> joins);

    @Query("DELETE FROM category_movie_join")
    void deleteAllCategoryMovieJoins();
}