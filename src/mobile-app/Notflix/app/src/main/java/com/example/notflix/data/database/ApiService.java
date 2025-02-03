package com.example.notflix.data.database;

import com.example.notflix.Entities.Movie;
import com.example.notflix.data.model.request.LoginRequest;
import com.example.notflix.data.model.response.AuthResponse;
import com.example.notflix.data.model.response.HomeMoviesResponse;

import java.util.List;
import java.util.Map;

import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.PartMap;
import retrofit2.http.Path;

public interface ApiService {

    @POST("api/tokens")
    Call<AuthResponse> login(@Body LoginRequest loginRequest);

    @Multipart
    @POST("api/users")
    Call<AuthResponse> signup(@PartMap Map<String, RequestBody> parts);

    // Fetch movies with userId in the headers
    @GET("api/movies")
    Call<HomeMoviesResponse> getHomeMovies(@Header("Authorization") String token);

    @GET("api/movies/{id}")
    Call<Movie> getMovieById(@Header("Authorization") String authToken, @Path("id") String movieId);

    @GET("api/movies/search/{query}")
    Call<List<Movie>> getSearch(@Header("Authorization") String authToken, @Path("query") String query);
}
