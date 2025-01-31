package com.example.notflix.data;

import android.util.Log;

import com.example.notflix.data.model.HomeMoviesResponse;
import com.example.notflix.data.model.MovieEntity;
import com.google.gson.Gson;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

/**
 * The {@code MovieDataSource} class is responsible for fetching the home screen data for a user,
 * including movies by category and recently watched movies.
 *
 * <p>This class utilizes the {@link ApiService} interface to perform API requests and callbacks
 * to notify about the success or failure of data fetching operations.
 *
 * <p>Base URL for the API requests is: {@code http://10.0.2.2:3001/}, which routes to the PC's localhost.
 */
public class MovieDataSource {
    private final MovieDao movieDao;
    private final CategoryDao categoryDao;
    private static final String TAG = "MovieDataSource";
    private static final String BASE_URL = "http://10.0.2.2:3001/"; // Routes to PC's localhost
    private final ApiService apiService;

    public interface HomeCallback {
        void onSuccess(Result<HomeMoviesResponse> result);
        void onError(Result<HomeMoviesResponse> result);
    }

    public MovieDataSource(AppDatabase database) {
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(BASE_URL)
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        apiService = retrofit.create(ApiService.class);

        this.movieDao = database.movieDao();
        this.categoryDao = database.categoryDao();
    }

    /**
     * Fetches the home screen data for the user.
     *
     * @param token    The token to fetch data for.
     * @param callback  The callback to notify about the result of the operation.
     */
    public void fetchHomeData(String token, HomeCallback callback) {
        String authHeader = "Bearer " + token; // Fixed variable name

        apiService.getHomeMovies(authHeader).enqueue(new Callback<HomeMoviesResponse>() {
            @Override
            public void onResponse(Call<HomeMoviesResponse> call, Response<HomeMoviesResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    HomeMoviesResponse data = response.body();

                    Log.d(TAG, "Received data: " + new Gson().toJson(data));
                    if (data.getCategoriesWithMovies() != null) {
                        Log.d(TAG, "Received categories: " + data.getCategoriesWithMovies().size());
                    }
                    if (data.getRecentlyWatched() != null) {
                        Log.d(TAG, "Received recent movies: " + data.getRecentlyWatched().size());
                    }

                    // Process and store data
                    AppDatabase.executor.execute(() -> {
                        try {
                            // Clear old data
                            movieDao.deleteAllMovies();
                            categoryDao.deleteAllCategories();

                            // Insert new data
                            List<MovieEntity> allMovies = new ArrayList<>();

                            // Process categories with movies
                            for (HomeMoviesResponse.CategoryMovies pair : data.getCategoriesWithMovies()) {
                                categoryDao.insertCategory(pair.getCategory());
                                allMovies.addAll(pair.getMovies());
                            }

                            // Process recently watched
                            allMovies.addAll(data.getRecentlyWatched());
                            movieDao.insertMovies(allMovies);

                            // Verify inserts
                            Log.d(TAG, "Stored categories: " + categoryDao.getAllCategoriesSync().size());
                            Log.d(TAG, "Stored movies: " + movieDao.getAllMoviesSync().size());

                            callback.onSuccess(new Result.Success<>(data));
                        } catch (Exception e) {
                            Log.e(TAG, "Transaction failed", e);
                            callback.onError(new Result.Error(e));
                        }
                    });
                } else {
                    // Error handling
                }
            }

            @Override
            public void onFailure(Call<HomeMoviesResponse> call, Throwable t) {
                callback.onError(new Result.Error(new IOException("Network error: " + t.getMessage())));
            }
        });
    }
}
