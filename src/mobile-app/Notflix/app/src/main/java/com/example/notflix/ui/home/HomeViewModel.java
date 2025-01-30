package com.example.notflix.ui.home;

import android.app.Application;

import androidx.core.util.Pair;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;

import com.example.notflix.data.HomeRepository;
import com.example.notflix.data.model.CategoryEntity;
import com.example.notflix.data.model.MovieEntity;

import java.util.List;

public class HomeViewModel extends AndroidViewModel {
    private final HomeRepository homeRepository;
    private final LiveData<Pair<List<Pair<CategoryEntity, List<MovieEntity>>>, List<MovieEntity>>> homeData;
    private final LiveData<Boolean> isLoading;
    private final String token;

    public HomeViewModel(Application application, String token) {
        super(application);
        this.token = token;
        homeRepository = new HomeRepository(application);
        homeData = homeRepository.getHomeData();
        isLoading = homeRepository.getIsDataLoading();
    }

    public LiveData<Pair<List<Pair<CategoryEntity, List<MovieEntity>>>, List<MovieEntity>>> getHomeData() {
        return homeData;
    }

    public LiveData<Boolean> getIsLoading() { // Expose loading state
        return isLoading;
    }

    public void refreshMovies(String token) {
        homeRepository.fetchAndCacheHomeData(token, new HomeRepository.DataCallback() {
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
