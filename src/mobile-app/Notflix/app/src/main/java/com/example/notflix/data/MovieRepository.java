package com.example.notflix.data;

import android.app.Application;
import android.util.Log;

import androidx.core.util.Pair;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.notflix.data.model.CategoryEntity;
import com.example.notflix.data.model.HomeMoviesResponse;
import com.example.notflix.data.model.MovieEntity;

import java.util.ArrayList;
import java.util.List;

public class MovieRepository {
    private final MovieDao movieDao;
    private final CategoryDao categoryDao;
    private final MovieDataSource movieDataSource;
    private final MutableLiveData<Boolean> isDataLoading = new MutableLiveData<>(false); // Loading state


    public interface DataCallback {
        void onSuccess();
        void onError(String errorMessage);
    }

    public MovieRepository(Application application) {
        AppDatabase db = AppDatabase.getInstance(application);
        movieDao = db.movieDao();
        categoryDao = db.categoryDao();
        movieDataSource = new MovieDataSource(db);
    }

    public LiveData<Boolean> getIsDataLoading() {
        return isDataLoading;
    }

    public void fetchAndCacheHomeData(String token, DataCallback callback) {
        isDataLoading.postValue(true);

        movieDataSource.fetchHomeData(token, new MovieDataSource.HomeCallback() {
            @Override
            public void onSuccess(Result<HomeMoviesResponse> result) {
                HomeMoviesResponse response = ((Result.Success<HomeMoviesResponse>) result).getData();

                AppDatabase.executor.execute(() -> {
                    try {
                        // Process categories and movies
                        List<MovieEntity> allMovies = new ArrayList<>();

                        // Handle categories with their movies
                        for (HomeMoviesResponse.CategoryMovies categoryMovies : response.getCategoriesWithMovies()) {
                            CategoryEntity category = categoryMovies.getCategory();
                            List<MovieEntity> movies = categoryMovies.getMovies();

                            // Insert category
                            categoryDao.insertCategory(category);

                            // Collect movies (category IDs should already be set from API)
                            allMovies.addAll(movies);
                        }

                        // Add recently watched movies
                        allMovies.addAll(response.getRecentlyWatched());

                        // Insert all movies in one transaction
                        movieDao.insertMovies(allMovies);

                        // Update UI
                        isDataLoading.postValue(false);
                        callback.onSuccess();
                    } catch (Exception e) {
                        Log.e("Repository", "Error caching data", e);
                        isDataLoading.postValue(false);
                        callback.onError("Failed to cache data");
                    }
                });
            }

            @Override
            public void onError(Result<HomeMoviesResponse> result) {
                isDataLoading.postValue(false);
                String errorMessage = "Unknown error occurred";

                if (result instanceof Result.Error) {
                    Exception error = ((Result.Error) result).getError();
                    errorMessage = error.getMessage();
                    Log.e("Repository", "API Error: ", error);
                }

                callback.onError(errorMessage);
            }
        });
    }

    public LiveData<List<MovieEntity>> getAllMovies() {
        return movieDao.getAllMovies();
    }

    public LiveData<MovieEntity> getMovieById(String movieId) {
        return movieDao.getMovieById(movieId);
    }

    public LiveData<List<CategoryEntity>> getAllCategories() {
        return categoryDao.getAllCategories();
    }

    public LiveData<List<MovieEntity>> getMoviesForCategory(String categoryId) {
        return movieDao.getMoviesForCategory(categoryId);
    }

    public void clearAllData() {
        AppDatabase.executor.execute(() -> {
            movieDao.deleteAllMovies();
            categoryDao.deleteAllCategories();
        });
    }

    public LiveData<Pair<List<Pair<CategoryEntity, List<MovieEntity>>>, List<MovieEntity>>> getHomeData() {
        MutableLiveData<Pair<List<Pair<CategoryEntity, List<MovieEntity>>>, List<MovieEntity>>> liveData = new MutableLiveData<>();

        AppDatabase.executor.execute(() -> {
            try {
                // Log before category fetch
                Log.d("DB_DEBUG", "Fetching categories...");
                List<CategoryEntity> categories = categoryDao.getAllCategoriesSync();
                Log.d("DB_DEBUG", "Categories found: " + (categories != null ? categories.size() : "null"));

                if (categories != null) {
                    for (CategoryEntity category : categories) {
                        Log.d("DB_DEBUG", "Processing category: " + category.getCategoryId() + " - " + category.getName());
                    }
                }

                // Log before recently watched movies fetch
                Log.d("DB_DEBUG", "Fetching recently watched movies...");
                List<MovieEntity> recentlyWatched = movieDao.getAllMoviesSync();
                Log.d("DB_DEBUG", "Recently watched movies found: " + (recentlyWatched != null ? recentlyWatched.size() : "null"));

                List<Pair<CategoryEntity, List<MovieEntity>>> categoriesWithMovies = new ArrayList<>();
                if (categories != null) {
                    for (CategoryEntity category : categories) {
                        Log.d("DB_DEBUG", "Fetching movies for category: " + category.getCategoryId());
                        List<MovieEntity> movies = movieDao.getMoviesForCategorySync(category.getCategoryId());
                        Log.d("DB_DEBUG", "Movies found for category " + category.getCategoryId() + ": " + (movies != null ? movies.size() : "null"));

                        if (movies != null && !movies.isEmpty()) {
                            categoriesWithMovies.add(new Pair<>(category, movies));
                        } else {
                            Log.d("DB_DEBUG", "No movies found for category: " + category.getCategoryId());
                        }
                    }
                }

                Log.d("DB_DEBUG", "Total categories with movies: " + categoriesWithMovies.size());
                Log.d("DB_DEBUG", "Recently watched movies count: " + (recentlyWatched != null ? recentlyWatched.size() : "null"));

                // Create the final pair
                Pair<List<Pair<CategoryEntity, List<MovieEntity>>>, List<MovieEntity>> result =
                        new Pair<>(categoriesWithMovies, recentlyWatched);

                Log.d("DB_DEBUG", "Posting value to LiveData - is result null? " + (result == null));
                liveData.postValue(result);

            } catch (Exception e) {
                Log.e("DB_DEBUG", "Error in database operation", e);
            } finally {
                Log.d("DB_DEBUG", "Database operation completed");
            }
        });
        // TODO - remember to delete
        if (liveData.getValue() != null) {
            StringBuilder logOutput = new StringBuilder("LiveData Contents:\n");

            // Get category-movie pairs
            List<Pair<CategoryEntity, List<MovieEntity>>> categoryMovies = liveData.getValue().first;

            // Process categories
            for (Pair<CategoryEntity, List<MovieEntity>> pair : categoryMovies) {
                CategoryEntity category = pair.first;
                List<MovieEntity> movies = pair.second;

                logOutput.append("\nCategory: ").append(category.toString())
                        .append("\nMovies in Category:\n");

                for (MovieEntity movie : movies) {
                    logOutput.append("  - ").append(movie.toString()).append("\n");
                }
            }

            // Process additional movies list
            List<MovieEntity> additionalMovies = liveData.getValue().second;
            logOutput.append("\nAdditional Movies:\n");
            for (MovieEntity movie : additionalMovies) {
                logOutput.append("  - ").append(movie.toString()).append("\n");
            }

            Log.i("home data", logOutput.toString());
        } else {
            Log.i("home data", "LiveData value is null");
        }
        return liveData;
    }
}