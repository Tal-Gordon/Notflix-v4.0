package com.example.notflix.data;

import com.example.notflix.data.model.ErrorResponse;
import com.example.notflix.data.model.LoggedInUser;
import com.example.notflix.data.model.LoginRequest;
import com.example.notflix.data.model.LoginResponse;
import com.google.gson.Gson;

import java.io.IOException;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
/**
 * The {@code LoginDataSource} class is responsible for handling the login and logout operations
 * for the application. It communicates with a remote server using Retrofit to authenticate users.
 *
 * <p>This class utilizes the {@link ApiService} interface to perform API requests and callbacks
 * to notify about the success or failure of login operations.
 *
 * <p>It supports the following functionalities:
 * <ul>
 *     <li>Login with username and password.</li>
 *     <li>Process server responses, including success and error handling.</li>
 *     <li>Provide a callback mechanism for login result delivery.</li>
 *     <li>A placeholder for future logout functionality.</li>
 * </ul>
 *
 * <p>Base URL for the API requests is: {@code http://10.0.2.2:3001/}, which routes to the PC's localhost.
 */
public class LoginDataSource {

    private static final String BASE_URL = "http://10.0.2.2:3001/"; // Routes to PC's localhost
    private final ApiService apiService;

    public interface LoginCallback {
        void onSuccess(Result<LoggedInUser> result);
        void onError(Result<LoggedInUser> result);
    }

    public LoginDataSource() {
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(BASE_URL)
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        apiService = retrofit.create(ApiService.class);
    }

    public void login(String username, String password, LoginCallback callback) {
        LoginRequest loginRequest = new LoginRequest(username, password);

        apiService.login(loginRequest).enqueue(new Callback<LoginResponse>() {
            @Override
            public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    LoginResponse loginResponse = response.body();
                    LoggedInUser user = new LoggedInUser(
                            loginResponse.getUserId(),
                            username
                    );
                    callback.onSuccess(new Result.Success<>(user));
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
                        callback.onError(new Result.Error(new IOException("Login failed")));
                    }
                }
            }

            @Override
            public void onFailure(Call<LoginResponse> call, Throwable t) {
                callback.onError(new Result.Error(new IOException("Error logging in: " + t.getMessage())));
            }
        });
    }

    public void logout() {
        // TODO: Implement logout if needed (e.g., invalidate token)
    }
}