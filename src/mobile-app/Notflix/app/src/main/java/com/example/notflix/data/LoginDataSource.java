package com.example.notflix.data;

import com.example.notflix.data.model.LoggedInUser;
import com.example.notflix.data.model.LoginRequest;
import com.example.notflix.data.model.LoginResponse;

import java.io.IOException;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

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
                    callback.onError(new Result.Error(new IOException("Login failed: " + response.code())));
                }
            }

            @Override
            public void onFailure(Call<LoginResponse> call, Throwable t) {
                callback.onError(new Result.Error(new IOException("Error logging in", t)));
            }
        });
    }

    public void logout() {
        // TODO: Implement logout if needed (e.g., invalidate token)
    }
}