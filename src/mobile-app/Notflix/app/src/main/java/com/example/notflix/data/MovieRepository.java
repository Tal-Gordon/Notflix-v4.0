package com.example.notflix.data;

import android.app.Application;
import android.util.Log;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.example.notflix.data.model.CategoryEntity;
import com.example.notflix.data.model.HomeData;
import com.example.notflix.data.model.MovieEntity;
import java.util.ArrayList;
import java.util.List;

public class MovieRepository {
    private static final String TAG = "MovieRepository";
    private final MovieDao movieDao;
    private final CategoryDao categoryDao;
    private final MovieDataSource movieDataSource;
    private final MutableLiveData<Boolean> isDataLoading = new MutableLiveData<>(false);
    private final MutableLiveData<HomeData> homeData = new MutableLiveData<>();

    public MovieRepository(Application application) {
        AppDatabase db = AppDatabase.getInstance(application);
        movieDao = db.movieDao();
        categoryDao = db.categoryDao();
        movieDataSource = new MovieDataSource();
    }

    public LiveData<Boolean> getIsDataLoading() {
        return isDataLoading;
    }

    public LiveData<HomeData> getHomeData() {
        return homeData;
    }

    public void fetchAndCacheHomeData(String token) {
        isDataLoading.postValue(true);

        movieDataSource.fetchProcessedHomeData(token, new MovieDataSource.HomeDataCallback() {
            @Override
            public void onSuccess(HomeData data) {
                AppDatabase.executor.execute(() -> {
                    try {
                        // Clear old data
                        clearAllData();

                        // Save all categories
                        for (CategoryEntity category : data.getCategories()) {
                            saveCategory(category);
                        }

                        // Save all movies with their updated category references
                        List<MovieEntity> allMovies = new ArrayList<>();
                        for (List<MovieEntity> movies : data.getMoviesByCategory().values()) {
                            allMovies.addAll(movies);
                        }

                        // For recently watched movies, add category "0" to their category list
                        List<MovieEntity> recentlyWatched = data.getMoviesByCategory().get("0");
                        if (recentlyWatched != null) {
                            for (MovieEntity movie : recentlyWatched) {
                                List<String> categoryIds = new ArrayList<>(movie.getCategoryIds());
                                if (!categoryIds.contains("0")) {
                                    categoryIds.add("0");
                                    movie.setCategoryIds(categoryIds);
                                }
                            }
                        }

                        saveMovies(allMovies);

                        // Update LiveData
                        homeData.postValue(data);
                        isDataLoading.postValue(false);
                    } catch (Exception e) {
                        Log.e(TAG, "Error caching data", e);
                        isDataLoading.postValue(false);
                    }
                });
            }

            @Override
            public void onError(String errorMessage) {
                Log.e(TAG, "Error fetching data: " + errorMessage);
                isDataLoading.postValue(false);
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
        movieDao.deleteAllMovies();
        categoryDao.deleteAllCategories();
    }

    private void saveMovies(List<MovieEntity> movies) {
        movieDao.insertMovies(movies);
    }

    private void saveCategory(CategoryEntity category) {
        categoryDao.insertCategory(category);
    }
}