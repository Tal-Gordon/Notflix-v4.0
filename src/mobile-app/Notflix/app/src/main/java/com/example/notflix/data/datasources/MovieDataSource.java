package com.example.notflix.data.datasources;

import com.example.notflix.Entities.Category;
import com.example.notflix.data.database.ApiService;
import com.example.notflix.data.model.processeddata.HomeData;
import com.example.notflix.data.model.response.HomeMoviesResponse;
import com.example.notflix.Entities.Movie;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    private static final String TAG = "MovieDataSource";
    private static final String BASE_URL = "http://10.0.2.2:3001/"; // Routes to PC's localhost
    private final ApiService apiService;

    public interface HomeMoviesCallback {
        void onSuccess(HomeMoviesResponse response);
        void onError(String errorMessage);
    }

    public interface HomeDataCallback {
        void onSuccess(HomeData data);
        void onError(String errorMessage);
    }

    public MovieDataSource() {
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(BASE_URL)
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        apiService = retrofit.create(ApiService.class);
    }

    /**
     * Fetches the home screen data for the user.
     *
     * @param token    The token to fetch data for.
     * @param callback  The callback to notify about the result of the operation.
     */
    public void fetchHomeData(String token, HomeMoviesCallback callback) {
        apiService.getHomeMovies("Bearer " + token).enqueue(new Callback<HomeMoviesResponse>() {
            @Override
            public void onResponse(Call<HomeMoviesResponse> call, Response<HomeMoviesResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    callback.onSuccess(response.body());
                } else {
                    callback.onError("Failed to fetch data: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<HomeMoviesResponse> call, Throwable t) {
                callback.onError("Network error: " + t.getMessage());
            }
        });
    }

    public void fetchProcessedHomeData(String token, HomeDataCallback callback) {
        fetchHomeData(token, new HomeMoviesCallback() {
            @Override
            public void onSuccess(HomeMoviesResponse response) {
                List<Category> categories = new ArrayList<>();
                Map<String, List<Movie>> moviesByCategory = new HashMap<>();

                // Process categories and movies from response
                for (HomeMoviesResponse.CategoryMovies categoryMovies : response.getMoviesByCategory()) {
                    Category category = categoryMovies.getCategory();
                    List<Movie> movies = categoryMovies.getMovies();

                    categories.add(category);
                    moviesByCategory.put(category.getCategoryId(), movies);
                }

                // Add recently watched as a special category
                List<Movie> recentlyWatched = response.getRecentlyWatched();
                if (recentlyWatched != null && !recentlyWatched.isEmpty()) {
                    List<String> recentlyWatchedIds = new ArrayList<>();
                    for (Movie movie : recentlyWatched) {
                        recentlyWatchedIds.add(movie.getMovieId());
                    }

                    Category recentlyWatchedCategory = new Category(
                            "0",
                            "Recently Watched",
                            true,
                            recentlyWatchedIds
                    );

                    categories.add(recentlyWatchedCategory);
                    moviesByCategory.put("0", recentlyWatched);

                    for (Movie movie : recentlyWatched) {
                        List<String> categoriesId = movie.getCategoryIds();
                        categoriesId.add(recentlyWatchedCategory.getCategoryId());
                        movie.setCategoryIds(categoriesId);
                    }
                }

                callback.onSuccess(new HomeData(categories, moviesByCategory));
            }

            @Override
            public void onError(String errorMessage) {
                callback.onError(errorMessage);
            }
        });
    }




//    public void fetchHomeData(String token, HomeCallback callback) {
//        String authHeader = "Bearer " + token; // Fixed variable name
//        Log.d(TAG, authHeader);
//        apiService.getHomeMovies(authHeader).enqueue(new Callback<HomeMoviesResponse>() {
//            @Override
//            public void onResponse(Call<HomeMoviesResponse> call, Response<HomeMoviesResponse> response) {
//                Log.d(TAG, "Raw API response: " + new Gson().toJson(response.body()));
//                if (response.isSuccessful() && response.body() != null) {
//                    HomeMoviesResponse data = response.body();
//                    Log.d(TAG, "The actual data: " + data);
//
//                    Log.d(TAG, "Received data: " + new Gson().toJson(data));
//                    if (data.getMoviesByCategory() != null) {
//                        Log.d(TAG, "Received categories: " + data.getMoviesByCategory().size());
//                    }
//                    if (data.getRecentlyWatched() != null) {
//                        Log.d(TAG, "Received recent movies: " + data.getRecentlyWatched().size());
//                    }
//
//                    // Process and store data
//                    AppDatabase.executor.execute(() -> {
//                        if (response.isSuccessful() && response.body() != null) {
//                            callback.onSuccess(new Result.Success<>(data));
//                        } else {
//                            try {
//                                Gson gson = new Gson();
//                                ErrorResponse errorResponse = gson.fromJson(
//                                        response.errorBody().charStream(),
//                                        ErrorResponse.class
//                                );
//                                String errorMessage = errorResponse.getError();
//                                callback.onError(new Result.Error(new IOException(errorMessage)));
//                            } catch (Exception e) {
//                                callback.onError(new Result.Error(new IOException("Login failed")));
//                            }
//                        }
//                    });
//                } else {
//                    Log.d(TAG, "the response was null: " + response.body());
//                }
//            }
//
//            @Override
//            public void onFailure(Call<HomeMoviesResponse> call, Throwable t) {
//                callback.onError(new Result.Error(new IOException("Network error: " + t.getMessage())));
//            }
//        });
//    }
}
