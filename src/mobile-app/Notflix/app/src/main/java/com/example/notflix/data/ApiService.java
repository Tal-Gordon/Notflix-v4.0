package com.example.notflix.data;

import com.example.notflix.data.model.AuthResponse;
import com.example.notflix.data.model.HomeMoviesResponse;
import com.example.notflix.data.model.LoginRequest;

import java.util.Map;

import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.PartMap;

public interface ApiService {

    @POST("api/tokens")
    Call<AuthResponse> login(@Body LoginRequest loginRequest);

    @Multipart
    @POST("api/users")
    Call<AuthResponse> signup(@PartMap Map<String, RequestBody> parts);

    // Fetch movies with userId in the headers
    @GET("api/movies")
    Call<HomeMoviesResponse> getHomeMovies(@Header("Authorization") String token);
}
