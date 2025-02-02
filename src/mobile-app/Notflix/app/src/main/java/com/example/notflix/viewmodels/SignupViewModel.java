package com.example.notflix.viewmodels;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.example.notflix.R;
import com.example.notflix.data.database.Result;
import com.example.notflix.data.datasources.UserDataSource;
import com.example.notflix.data.repositories.UserRepository;
import com.example.notflix.data.model.ErrorMapper;
import com.example.notflix.data.model.processeddata.LoggedInUser;
import com.example.notflix.auth.AuthResult;
import com.example.notflix.auth.LoggedInUserView;
import com.example.notflix.formstate.SignupFormState;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class SignupViewModel extends ViewModel {

    private final MutableLiveData<SignupFormState> signupFormState = new MutableLiveData<>();
    private final MutableLiveData<AuthResult> signupResult = new MutableLiveData<>();
    private final UserRepository userRepository;

    public SignupViewModel(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public LiveData<SignupFormState> getSignupFormState() {
        return signupFormState;
    }

    public LiveData<AuthResult> getSignupResult() {
        return signupResult;
    }

    public void Signup(String username, String password, String name, String surname) {
        userRepository.signup(username, password, name, surname, new UserDataSource.AuthCallback() {
            @Override
            public void onSuccess(Result<LoggedInUser> result) {
                // Handle UI updates
                if (result instanceof Result.Success) {
                    LoggedInUser user = ((Result.Success<LoggedInUser>) result).getData();
                    signupResult.postValue(new AuthResult(new LoggedInUserView(user.getToken(), user.getUsername())));
                }
            }

            @Override
            public void onError(Result<LoggedInUser> result) {
                int errorResId = R.string.error_unknown;
                if (result instanceof Result.Error) {
                    Exception error = ((Result.Error) result).getError();
                    String errorMessage = error.getMessage(); // Extract message from backend
                    errorResId = ErrorMapper.getErrorResource(errorMessage); // Map to string resource
                }
                signupResult.postValue(new AuthResult(errorResId));
            }
        });
    }

    public void signupDataChanged(String username, String password) {
        // Checks that username is not empty
        if (isInputNotValid(username)) {
            signupFormState.setValue(new SignupFormState(R.string.username_empty, null));
            return;
        }

        // Checks that password is not empty
        if (isInputNotValid(password)) {
            signupFormState.setValue(new SignupFormState(null, R.string.password_empty));
            return;
        }

        if (!isPasswordValidRegex(password)) {
            signupFormState.setValue(new SignupFormState(null, R.string.password_invalid_format));
            return;
        }

        // All validations passed
        signupFormState.setValue(new SignupFormState(true));
    }

    private boolean isInputNotValid(String input) {
        if (input == null) {
            return true;
        } else {
            return input.trim().isEmpty();
        }
    }

    private boolean isPasswordValidRegex(String password) {
        String regex = "^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\\da-zA-Z]).{8,}$";

        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(password);

        return matcher.matches();
    }
}