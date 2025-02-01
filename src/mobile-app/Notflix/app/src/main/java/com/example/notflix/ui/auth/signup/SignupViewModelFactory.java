package com.example.notflix.ui.auth.signup;

import android.app.Application;

import androidx.lifecycle.ViewModel;
import androidx.lifecycle.ViewModelProvider;

import com.example.notflix.data.UserRepository;
import com.example.notflix.ui.auth.login.LoginViewModel;

public class SignupViewModelFactory implements ViewModelProvider.Factory {
    private Application application;

    public SignupViewModelFactory(Application application) {
        this.application = application;
    }

    @Override
    public <T extends ViewModel > T create(Class<T> modelClass) {
        if (modelClass.isAssignableFrom(SignupViewModel.class)) {
            UserRepository repository = new UserRepository(application);
            return (T) new SignupViewModel(repository);
        }
        throw new IllegalArgumentException("Unknown ViewModel class");
    }
}