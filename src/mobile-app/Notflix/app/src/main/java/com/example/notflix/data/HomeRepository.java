package com.example.notflix.data;

import android.app.Application;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.core.util.Pair;

import com.example.notflix.data.model.CategoryEntity;
import com.example.notflix.data.model.HomeResponse;
import com.example.notflix.data.model.MovieEntity;

import java.util.ArrayList;
import java.util.List;

public class HomeRepository {
    private final MovieDao movieDao;
    private final CategoryDao categoryDao;
    private final HomeDataSource homeDataSource;
    private final MutableLiveData<Boolean> isDataLoading = new MutableLiveData<>(false); // Loading state


    public interface DataCallback {
        void onSuccess();
        void onError(String errorMessage);
    }

    public HomeRepository(Application application) {
        AppDatabase db = AppDatabase.getInstance(application);
        movieDao = db.movieDao();
        categoryDao = db.categoryDao();
        homeDataSource = new HomeDataSource();
    }

    public LiveData<Boolean> getIsDataLoading() {
        return isDataLoading;
    }

    public void fetchAndCacheHomeData(String token, DataCallback callback) {
        isDataLoading.postValue(true); // Set loading to true

        homeDataSource.fetchHomeData(token, new HomeDataSource.HomeCallback() {
            @Override
            public void onSuccess(Result<HomeResponse> result) {
                HomeResponse homeResponse = ((Result.Success<HomeResponse>) result).getData();

                AppDatabase.executor.execute(() -> {
                    movieDao.deleteAllMovies();
                    categoryDao.deleteAllCategories();

                    for (Pair<CategoryEntity, List<MovieEntity>> pair : homeResponse.getMoviesByCategory()) {
                        CategoryEntity category = pair.first;
                        List<MovieEntity> movies = pair.second;

                        categoryDao.insertCategory(category);

                        for (MovieEntity movie : movies) {
                            movie.setCategoryIds(List.of(category.getCategoryId()));
                            movieDao.insertMovie(movie);
                        }
                    }
                    movieDao.insertMovies(homeResponse.getRecentlyWatched()); // Save recently watched
                    isDataLoading.postValue(false); // Set loading to false
                    callback.onSuccess();
                });
            }

            @Override
            public void onError(Result<HomeResponse> result) {
                isDataLoading.postValue(false);

                if (result instanceof Result.Error) {
                    Result.Error errorResult = (Result.Error) result;
                    String errorMessage = errorResult.getError().getMessage();
                    callback.onError(errorMessage);
                } else {
                    callback.onError("Unknown error occurred.");
                }
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
            // Use synchronous DAO methods
            List<CategoryEntity> categories = categoryDao.getAllCategoriesSync(); // Sync call
            List<MovieEntity> recentlyWatched = movieDao.getAllMoviesSync(); // Sync call

            List<Pair<CategoryEntity, List<MovieEntity>>> categoriesWithMovies = new ArrayList<>();
            for (CategoryEntity category : categories) {
                List<MovieEntity> movies = movieDao.getMoviesForCategorySync(category.getCategoryId()); // Sync call
                categoriesWithMovies.add(new Pair<>(category, movies));
            }

            liveData.postValue(new Pair<>(categoriesWithMovies, recentlyWatched));
        });

        return liveData; // Return the MutableLiveData, NOT null
    }
}