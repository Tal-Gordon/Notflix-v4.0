package com.example.notflix.data.datasources;

import android.util.Log;

import com.example.notflix.Entities.Category;
import com.example.notflix.Entities.Movie;
import com.example.notflix.data.database.ApiService;
import com.example.notflix.data.model.processeddata.HomeData;
import com.example.notflix.data.model.response.ErrorResponse;
import com.example.notflix.data.model.response.HomeMoviesResponse;
import com.google.gson.Gson;

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

    public interface MovieCallback {
        void onSuccess(Movie response);

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
     * @param callback The callback to notify about the result of the operation.
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

    public void fetchMovieById(String token, String movieId, MovieCallback callback) {
        apiService.getMovieById("Bearer " + token, movieId).enqueue(new Callback<Movie>() { // Ensure ID is passed
            @Override
            public void onResponse(Call<Movie> call, Response<Movie> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Log.d(TAG, "The API returned: " + response.body().toString());
                    callback.onSuccess(response.body());
                } else {
                    callback.onError("Failed to fetch movie: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<Movie> call, Throwable throwable) {
                callback.onError("Network error: " + throwable.getMessage());
            }
        });
    }

    // In MovieDataSource.java
    public interface MovieListCallback {
        void onSuccess(List<Movie> movies);

        void onError(String errorMessage);  // Matches other callbacks
    }

    public void searchMovies(String token, String query, MovieListCallback callback) {
        apiService.getSearch("Bearer " + token, query).enqueue(new Callback<List<Movie>>() {
            @Override
            public void onResponse(Call<List<Movie>> call, Response<List<Movie>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    callback.onSuccess(response.body());
                } else {
                    try {
                        ErrorResponse error = new Gson().fromJson(
                                response.errorBody().charStream(),
                                ErrorResponse.class
                        );
                        callback.onError(error != null ?
                                error.getError() : "Error: " + response.code());
                    } catch (Exception e) {
                        callback.onError("Failed to parse error response");
                    }
                }
            }

            @Override
            public void onFailure(Call<List<Movie>> call, Throwable t) {
                callback.onError("Network error: " + t.getMessage());
            }
        });
    }

    public void getRecommendations(String token, String movieId, MovieListCallback callback) {
        apiService.getRecommendations("Bearer " + token, movieId).enqueue(new Callback<List<Movie>>() {
            @Override
            public void onResponse(Call<List<Movie>> call, Response<List<Movie>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    callback.onSuccess(response.body());
                } else if (response.code() == 404) {
                    callback.onSuccess(new ArrayList<>());
                } else {
                    try {
                        ErrorResponse error = new Gson().fromJson(
                                response.errorBody().charStream(),
                                ErrorResponse.class
                        );
                        callback.onError(error != null ?
                                error.getError() : "Error: " + response.code());
                    } catch (Exception e) {
                        callback.onError("Failed to parse error response");
                    }
                }
            }

            @Override
            public void onFailure(Call<List<Movie>> call, Throwable t) {
                callback.onError("Network error: " + t.getMessage());
            }
        });
    }
}
