package com.example.notflix.viewmodels;

import android.app.Application;
import android.util.Log;

import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.notflix.Entities.Movie;
import com.example.notflix.data.repositories.MovieRepository;

import java.util.ArrayList;
import java.util.List;

public class SearchViewModel extends AndroidViewModel {
    private static final String TAG = "SearchViewModel";
    private final MovieRepository movieRepository;
    private final MutableLiveData<List<Movie>> searchResults = new MutableLiveData<>();
    private final MutableLiveData<Boolean> isSearching = new MutableLiveData<>();
    private final MutableLiveData<String> error = new MutableLiveData<>();

    public SearchViewModel(Application application) {
        super(application);
        movieRepository = new MovieRepository(application);
    }

    public void performSearch(String token, String query) {
        if (query == null || query.trim().isEmpty()) {
            return;
        }

        isSearching.setValue(true);
        movieRepository.searchMovies(token, query.trim(), new MovieRepository.MovieListCallback() {
            @Override
            public void onSuccess(List<Movie> movies) {
                isSearching.postValue(false);
                searchResults.postValue(movies);
            }

            @Override
            public void onError(String errorMessage) {
                Log.e(TAG, "Search error: " + errorMessage);
                isSearching.postValue(false);
                error.postValue(errorMessage);
                searchResults.postValue(new ArrayList<>());
            }
        });
    }

    public LiveData<List<Movie>> getSearchResults() {
        return searchResults;
    }

    public LiveData<Boolean> getIsSearching() {
        return isSearching;
    }

    public LiveData<String> getError() {
        return error;
    }
}