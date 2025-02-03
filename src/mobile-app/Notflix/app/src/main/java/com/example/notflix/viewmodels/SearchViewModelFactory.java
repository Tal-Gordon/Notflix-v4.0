package com.example.notflix.viewmodels;

import android.app.Application;
import androidx.lifecycle.ViewModel;
import androidx.lifecycle.ViewModelProvider;

public class SearchViewModelFactory implements ViewModelProvider.Factory {
    private final Application application;

    public SearchViewModelFactory(Application application) {
        this.application = application;
    }

    @Override
    public <T extends ViewModel> T create(Class<T> modelClass) {
        if (modelClass.isAssignableFrom(SearchViewModel.class)) {
            return (T) new SearchViewModel(application);
        }
        throw new IllegalArgumentException("Unknown ViewModel class");
    }
}