package com.example.notflix.ui.home;

import android.app.Application;
import androidx.lifecycle.ViewModel;
import androidx.lifecycle.ViewModelProvider;

public class HomeViewModelFactory implements ViewModelProvider.Factory {
    private final Application application;
    private final String token;

    public HomeViewModelFactory(Application application, String token) {
        this.application = application;
        this.token = token;
    }

    @Override
    public <T extends ViewModel> T create(Class<T> modelClass) {
        if (modelClass.isAssignableFrom(HomeViewModel.class)) {
            return (T) new HomeViewModel(application, token);
        }
        throw new IllegalArgumentException("Unknown ViewModel class");
    }
}