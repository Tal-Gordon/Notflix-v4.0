package com.example.notflix.data.datasources;

import com.example.notflix.data.database.ApiService;
import com.example.notflix.data.database.Result;
import com.example.notflix.data.model.response.ErrorResponse;
import com.example.notflix.data.model.processeddata.LoggedInUser;
import com.example.notflix.data.model.request.LoginRequest;
import com.example.notflix.data.model.response.AuthResponse;
import com.example.notflix.data.model.request.SignupRequest;
import com.google.gson.Gson;

import java.io.IOException;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
/**
 * The {@code UserDataSource} class is responsible for handling user authentication operations
 * for the application. It communicates with a remote server using Retrofit to authenticate users.
 *
 * <p>This class utilizes the {@link ApiService} interface to perform API requests and callbacks
 * to notify about the success or failure of login and sign up operations.
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
public class UserDataSource {

    private static final String BASE_URL = "http://10.0.2.2:3001/";
    private final ApiService apiService;

    public interface AuthCallback {
        void onSuccess(Result<LoggedInUser> result);
        void onError(Result<LoggedInUser> result);
    }

    public interface LogoutCallback {
        void onSuccess();
        void onError(Result<LoggedInUser> result);
    }

    public UserDataSource() {
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(BASE_URL)
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        apiService = retrofit.create(ApiService.class);
    }

    public void login(String username, String password, AuthCallback callback) {
        LoginRequest loginRequest = new LoginRequest(username, password);

        apiService.login(loginRequest).enqueue(new Callback<AuthResponse>() {
            @Override
            public void onResponse(Call<AuthResponse> call, Response<AuthResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    AuthResponse authResponse = response.body();
                    LoggedInUser user = new LoggedInUser(
                            authResponse.getToken(),
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
            public void onFailure(Call<AuthResponse> call, Throwable t) {
                callback.onError(new Result.Error(new IOException("Error logging in: " + t.getMessage())));
            }
        });
    }

    public void signup(String username, String password, String name, String surname, AuthCallback callback) {
        SignupRequest signupRequest = new SignupRequest(username, password, name, surname);

        apiService.signup(signupRequest.toPartMap()).enqueue(new Callback<AuthResponse>() {
            @Override
            public void onResponse(Call<AuthResponse> call, Response<AuthResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    AuthResponse authResponse = response.body();
                    LoggedInUser user = new LoggedInUser(
                            authResponse.getToken(),
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
                        callback.onError(new Result.Error(new IOException("Signup failed")));
                    }
                }
            }

            @Override
            public void onFailure(Call<AuthResponse> call, Throwable t) {
                callback.onError(new Result.Error(new IOException("Error signing up: " + t.getMessage())));
            }
        });
    }

//    public void logout(String token, LogoutCallback callback) {
//
//        // Should we have a logout function in the backend that invalidates tokens?
//        apiService.logout(token).enqueue(new Callback<Void>() {
//            @Override
//            public void onResponse(Call<Void> call, Response<Void> response) {
//                if (response.isSuccessful()) {
//                    clearLocalUserData(callback);
//                } else {
//                    // Handle logout error on the server-side
//                    try {
//                        Gson gson = new Gson();
//                        ErrorResponse errorResponse = gson.fromJson(
//                                response.errorBody().charStream(),
//                                ErrorResponse.class
//                        );
//                        String errorMessage = errorResponse.getError();
//                        callback.onError(new Result.Error(new IOException(errorMessage)));
//                    } catch (Exception e) {
//                        callback.onError(new Result.Error(new IOException("Logout failed on server")));
//                    }
//                }
//            }
//
//            @Override
//            public void onFailure(Call<Void> call, Throwable t) {
//                callback.onError(new Result.Error(new IOException("Network error during logout: " + t.getMessage())));
//            }
//        });
//    }
}