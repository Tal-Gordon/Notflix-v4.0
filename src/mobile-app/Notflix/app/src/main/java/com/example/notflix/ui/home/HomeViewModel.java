package com.example.notflix.ui.home;

import android.app.Application;
import android.util.Log;

import androidx.core.util.Pair;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;

import com.example.notflix.data.MovieRepository;
import com.example.notflix.data.UserRepository;
import com.example.notflix.data.model.CategoryEntity;
import com.example.notflix.data.model.MovieEntity;

import java.util.List;

public class HomeViewModel extends AndroidViewModel {
    private final MovieRepository movieRepository;
    private final UserRepository userRepository;
    private final LiveData<Pair<List<Pair<CategoryEntity, List<MovieEntity>>>, List<MovieEntity>>> homeData;
    private final LiveData<Boolean> isLoading;
    private String token;

    public HomeViewModel(Application application) {
        super(application);
        movieRepository = new MovieRepository(application);
        userRepository = new UserRepository(application);
        homeData = movieRepository.getHomeData();
        isLoading = movieRepository.getIsDataLoading();
        userRepository.getLoggedInUser().observeForever(user -> {
            if (user != null) {
                Log.d("user1111", user.getToken());
                token = user.getToken();
            } else {
                Log.d("user1111", ":(");
                token = null;
            }
        });
    }

    public LiveData<Pair<List<Pair<CategoryEntity, List<MovieEntity>>>, List<MovieEntity>>> getHomeData() {
        return homeData;
    }

    public LiveData<Boolean> getIsLoading() { // Expose loading state
        return isLoading;
    }

    public void refreshMovies() {
        movieRepository.fetchAndCacheHomeData(token, new MovieRepository.DataCallback() {
            @Override
            public void onSuccess() {
                // No need to do anything here. The loading state is handled by the repository.
            }

            @Override
            public void onError(String errorMessage) {
                // Handle the error in the UI, maybe show a Toast or Snackbar.
            }
        });
    }
}
