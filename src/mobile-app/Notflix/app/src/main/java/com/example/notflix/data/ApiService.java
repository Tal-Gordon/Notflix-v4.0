package com.example.notflix.data;

import com.example.notflix.data.model.HomeMoviesRequest;
import com.example.notflix.data.model.LoginRequest;
import com.example.notflix.data.model.LoginResponse;
import com.example.notflix.data.model.HomeResponse;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;

public interface ApiService {

    @POST("api/tokens")
    Call<LoginResponse> login(@Body LoginRequest loginRequest);

    // Fetch movies with userId in the headers
    @GET("api/movies")
    Call<HomeResponse> getHomeMovies(@Header("Bearer")HomeMoviesRequest homeMoviesRequest);
}
