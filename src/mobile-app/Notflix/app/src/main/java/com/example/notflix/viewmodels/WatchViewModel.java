package com.example.notflix.viewmodels;

import android.app.Application;

import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.notflix.Entities.Movie;
import com.example.notflix.data.repositories.MovieRepository;

public class WatchViewModel extends AndroidViewModel {
    private final MovieRepository movieRepository;
    private final MutableLiveData<Movie> movie = new MutableLiveData<>();
    private final MutableLiveData<Boolean> isLoading = new MutableLiveData<>();
    private final MutableLiveData<String> error = new MutableLiveData<>();

    public WatchViewModel(Application application) {
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

    // LiveData exposers
    public LiveData<Movie> getMovie() { return movie; }
    public LiveData<Boolean> getIsLoading() { return isLoading; }
    public LiveData<String> getError() { return error; }
}