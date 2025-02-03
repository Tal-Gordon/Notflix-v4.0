package com.example.notflix.data.repositories;

import android.app.Application;

import androidx.lifecycle.LiveData;

import com.example.notflix.Entities.Category;
import com.example.notflix.data.daos.CategoryDao;
import com.example.notflix.data.database.AppDatabase;

public class CategoryRepository {
    private final CategoryDao categoryDao;
    public CategoryRepository(Application application) {
        AppDatabase db = AppDatabase.getInstance(application);
        categoryDao = db.categoryDao();
    }

    public LiveData<Category> getCategoryById(String categoryId) {
        return categoryDao.getCategoryById(categoryId);
    }
}
