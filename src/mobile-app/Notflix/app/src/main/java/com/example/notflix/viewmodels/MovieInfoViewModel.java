package com.example.notflix.viewmodels;

import android.app.Application;

import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.notflix.Entities.Movie;
import com.example.notflix.data.repositories.MovieRepository;

import java.util.ArrayList;
import java.util.List;

public class MovieInfoViewModel extends AndroidViewModel {
    private final MovieRepository movieRepository;
    private final MutableLiveData<Movie> movie = new MutableLiveData<>();
    private final MutableLiveData<Boolean> isLoading = new MutableLiveData<>();
    private final MutableLiveData<String> error = new MutableLiveData<>();
    private final MutableLiveData<List<Movie>> recommendationsResults = new MutableLiveData<>();

    public MutableLiveData<List<Movie>> getRecommendationsResults() {
        return recommendationsResults;
    }

    public MovieInfoViewModel(Application application) {
        super(application);
        movieRepository = new MovieRepository(application);
    }

    public void fetchMovie(String token, String movieId) {
        isLoading.setValue(true);
        movieRepository.fetchMovieById(token, movieId, new MovieRepository.MovieCallback() {
            @Override
            public void onSuccess(Movie result) {
                isLoading.postValue(false);
                movie.postValue(result);
            }

            @Override
            public void onError(String errorMessage) {
                isLoading.postValue(false);
                error.postValue(errorMessage);
            }
        });
    }

    public void getRecommendations(String token, String movieId) {
        movieRepository.getRecommendations(token, movieId, new MovieRepository.MovieListCallback() {
            @Override
            public void onSuccess(List<Movie> movies) {
                recommendationsResults.postValue(movies);
            }

            @Override
            public void onError(String errorMessage) {
                recommendationsResults.postValue(new ArrayList<>());
            }
        });
    }

    // LiveData exposers
    public LiveData<Movie> getMovie() { return movie; }
    public LiveData<Boolean> getIsLoading() { return isLoading; }
    public LiveData<String> getError() { return error; }
}
