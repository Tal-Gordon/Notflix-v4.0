package com.example.notflix.data.daos;

import androidx.lifecycle.LiveData;
import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;

import com.example.notflix.Entities.Category;

import java.util.List;

@Dao
public interface CategoryDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertCategory(Category category);

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertCategories(List<Category> categories);

    @Query("SELECT * FROM Categories")
    LiveData<List<Category>> getAllCategories();

    @Query("SELECT * FROM Categories WHERE categoryId = :categoryId")
    LiveData<Category> getCategoryById(String categoryId);

    @Query("DELETE FROM Categories")
    void deleteAllCategories();

    @Query("SELECT * FROM Categories")
    List<Category> getAllCategoriesSync(); // No LiveData wrapper
}