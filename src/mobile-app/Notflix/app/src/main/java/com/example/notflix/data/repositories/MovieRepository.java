package com.example.notflix.data.repositories;

import android.app.Application;
import android.util.Log;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.notflix.Entities.Category;
import com.example.notflix.Entities.Movie;
import com.example.notflix.data.daos.CategoryDao;
import com.example.notflix.data.daos.MovieDao;
import com.example.notflix.data.database.AppDatabase;
import com.example.notflix.data.datasources.MovieDataSource;
import com.example.notflix.data.model.processeddata.HomeData;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class MovieRepository {
    private static final String TAG = "MovieRepository";
    private final MovieDao movieDao;
    private final CategoryDao categoryDao;
    private final MovieDataSource movieDataSource;
    private final MutableLiveData<Boolean> isDataLoading = new MutableLiveData<>(false);
    private final MutableLiveData<HomeData> homeData = new MutableLiveData<>();
    private final MutableLiveData<List<Movie>> searchResults = new MutableLiveData<>();
    private final MutableLiveData<Boolean> isSearching = new MutableLiveData<>(false);

    public MovieRepository(Application application) {
        AppDatabase db = AppDatabase.getInstance(application);
        movieDao = db.movieDao();
        categoryDao = db.categoryDao();
        movieDataSource = new MovieDataSource();
    }

    public interface MovieListCallback {
        void onSuccess(List<Movie> movies);
        void onError(String errorMessage);
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
                        for (Category category : data.getCategories()) {
                            saveCategory(category);
                        }

                        // Save all movies with their updated category references
                        List<Movie> allMovies = new ArrayList<>();
                        for (List<Movie> movies : data.getMoviesByCategory().values()) {
                            allMovies.addAll(movies);
                        }

                        // For recently watched movies, add category "0" to their category list
                        List<Movie> recentlyWatched = data.getMoviesByCategory().get("0");
                        if (recentlyWatched != null) {
                            for (Movie movie : recentlyWatched) {
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

    public interface MovieCallback {
        void onSuccess(Movie result);
        void onError(String errorMessage);
    }

    public void fetchMovieById(String token, String movieId, MovieCallback callback) {
        movieDataSource.fetchMovieById(token, movieId, new MovieDataSource.MovieCallback() {
            @Override
            public void onSuccess(Movie response) {
                callback.onSuccess(response);
            }

            @Override
            public void onError(String errorMessage) {
                callback.onError(errorMessage);
            }
        });
    }

    public LiveData<List<Movie>> getSearchResults() {
        return searchResults;
    }

    public LiveData<Boolean> getIsSearching() {
        return isSearching;
    }

    public void searchMovies(String token, String query, MovieListCallback callback) {
        isSearching.postValue(true);

        movieDataSource.searchMovies(token, query, new MovieDataSource.MovieListCallback() {
            @Override
            public void onSuccess(List<Movie> movies) {
                AppDatabase.executor.execute(() -> {
                    try {
                        // Filter out movies that already exist in Room
                        List<Movie> existingMovies = movieDao.getAllMoviesSync();
                        Set<String> existingMovieIds = existingMovies.stream()
                                .map(Movie::getMovieId)
                                .collect(Collectors.toSet());

                        List<Movie> newMovies = movies.stream()
                                .filter(movie -> !existingMovieIds.contains(movie.getMovieId()))
                                .collect(Collectors.toList());

                        // Save new movies to Room
                        if (!newMovies.isEmpty()) {
                            movieDao.insertMovies(newMovies);
                        }

                        // Post all search results to LiveData and callback
                        searchResults.postValue(movies);
                        isSearching.postValue(false);
                        callback.onSuccess(movies);
                    } catch (Exception e) {
                        Log.e(TAG, "Error processing search results", e);
                        searchResults.postValue(new ArrayList<>());
                        isSearching.postValue(false);
                        callback.onError("Error processing search results: " + e.getMessage());
                    }
                });
            }

            @Override
            public void onError(String errorMessage) {
                Log.e(TAG, "Search error: " + errorMessage);
                searchResults.postValue(new ArrayList<>());
                isSearching.postValue(false);
                callback.onError(errorMessage);
            }
        });
    }

    public void getRecommendations(String token, String movieId, MovieListCallback callback) {
        movieDataSource.getRecommendations(token, movieId, new MovieDataSource.MovieListCallback() {
            @Override
            public void onSuccess(List<Movie> movies) {
                AppDatabase.executor.execute(() -> {
                    try {
                        // Filter out movies that already exist in Room
                        List<Movie> existingMovies = movieDao.getAllMoviesSync();
                        Set<String> existingMovieIds = existingMovies.stream()
                                .map(Movie::getMovieId)
                                .collect(Collectors.toSet());

                        List<Movie> newMovies = movies.stream()
                                .filter(movie -> !existingMovieIds.contains(movie.getMovieId()))
                                .collect(Collectors.toList());

                        // Save new movies to Room
                        if (!newMovies.isEmpty()) {
                            movieDao.insertMovies(newMovies);
                        }

                        callback.onSuccess(movies);
                    } catch (Exception e) {
                        callback.onError("Error processing recommendation results: " + e.getMessage());
                    }
                });
            }

            @Override
            public void onError(String errorMessage) {
                callback.onError(errorMessage);
            }
        });
    }
    public LiveData<List<Movie>> getAllMovies() {
        return movieDao.getAllMovies();
    }

    public LiveData<Movie> getMovieById(String movieId) {
        return movieDao.getMovieById(movieId);
    }

    public LiveData<List<Category>> getAllCategories() {
        return categoryDao.getAllCategories();
    }

    public LiveData<List<Movie>> getMoviesForCategory(String categoryId) {
        return movieDao.getMoviesForCategory(categoryId);
    }

    public void clearAllData() {
        movieDao.deleteAllMovies();
        categoryDao.deleteAllCategories();
    }

    private void saveMovies(List<Movie> movies) {
        movieDao.insertMovies(movies);
    }

    private void saveCategory(Category category) {
        categoryDao.insertCategory(category);
    }
}