package com.example.notflix.data;

import com.example.notflix.data.model.ErrorResponse;
import com.example.notflix.data.model.HomeMoviesRequest;
import com.example.notflix.data.model.HomeResponse;
import com.google.gson.Gson;

import java.io.IOException;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

/**
 * The {@code HomeDataSource} class is responsible for fetching the home screen data for a user,
 * including movies by category and recently watched movies.
 *
 * <p>This class utilizes the {@link ApiService} interface to perform API requests and callbacks
 * to notify about the success or failure of data fetching operations.
 *
 * <p>Base URL for the API requests is: {@code http://10.0.2.2:3001/}, which routes to the PC's localhost.
 */
public class HomeDataSource {

    private static final String BASE_URL = "http://10.0.2.2:3001/"; // Routes to PC's localhost
    private final ApiService apiService;

    public interface HomeCallback {
        void onSuccess(Result<HomeResponse> result);
        void onError(Result<HomeResponse> result);
    }

    public HomeDataSource() {
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
    public void fetchHomeData(String token, HomeCallback callback) {
        apiService.getHomeMovies(new HomeMoviesRequest(token)).enqueue(new Callback<HomeResponse>() {
            @Override
            public void onResponse(Call<HomeResponse> call, Response<HomeResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    HomeResponse homeResponse = response.body();
                    callback.onSuccess(new Result.Success<>(homeResponse));
                } else {
                    try {
                        Gson gson = new Gson();
                        ErrorResponse errorResponse = gson.fromJson(
                                response.errorBody().charStream(),
                                ErrorResponse.class
                        );
                        String errorMessage = errorResponse.getError();
                        callback.onError(new Result.Error(new IOException(errorMessage)));
                    } catch (Exception e) {
                        callback.onError(new Result.Error(new IOException("Failed to fetch home data")));
                    }
                }
            }

            @Override
            public void onFailure(Call<HomeResponse> call, Throwable t) {
                callback.onError(new Result.Error(new IOException("Error fetching home data: " + t.getMessage())));
            }
        });
    }
}
