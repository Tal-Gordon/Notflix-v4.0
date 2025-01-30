package com.example.notflix.data;

import androidx.lifecycle.LiveData;
import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;
import com.example.notflix.data.model.CategoryEntity;
import java.util.List;

@Dao
public interface CategoryDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertCategory(CategoryEntity category);

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertCategories(List<CategoryEntity> categories);

    @Query("SELECT * FROM categories")
    LiveData<List<CategoryEntity>> getAllCategories();

    @Query("SELECT * FROM categories WHERE categoryId = :categoryId")
    LiveData<CategoryEntity> getCategoryById(String categoryId);

    @Query("DELETE FROM categories")
    void deleteAllCategories();

    @Query("SELECT * FROM categories")
    List<CategoryEntity> getAllCategoriesSync(); // No LiveData wrapper
}