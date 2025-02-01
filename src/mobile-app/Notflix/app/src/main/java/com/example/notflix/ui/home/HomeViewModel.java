package com.example.notflix.ui.home;

import android.app.Application;
import android.util.Log;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import com.example.notflix.data.MovieRepository;
import com.example.notflix.data.UserRepository;
import com.example.notflix.data.model.HomeData;

public class HomeViewModel extends AndroidViewModel {
    private static final String TAG = "HomeViewModel";
    private final MovieRepository movieRepository;
    private final UserRepository userRepository;
    private final LiveData<HomeData> homeData;
    private final LiveData<Boolean> isLoading;
    private String token;

    public HomeViewModel(Application application) {
        super(application);
        movieRepository = new MovieRepository(application);
        userRepository = new UserRepository(application);
        homeData = movieRepository.getHomeData();
        isLoading = movieRepository.getIsDataLoading();
        token = userRepository.getToken();

        Log.d(TAG, "Token value in constructor: " + token);
    }

    public void refreshMovies() {
        if (token != null && !token.isEmpty()) {
            movieRepository.fetchAndCacheHomeData(token);
        } else {
            Log.e(TAG, "Cannot refresh movies: token is null or empty");
        }
    }

    public LiveData<Boolean> getIsLoading() {
        return isLoading;
    }

    public LiveData<HomeData> getHomeData() {
        return homeData;
    }

    public void logout() {
        // Implement this in UserRepository if needed
    }
}