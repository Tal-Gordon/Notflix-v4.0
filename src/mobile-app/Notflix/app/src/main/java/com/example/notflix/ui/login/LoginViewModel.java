package com.example.notflix.ui.login;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.example.notflix.R;
import com.example.notflix.data.LoginDataSource;
import com.example.notflix.data.LoginRepository;
import com.example.notflix.data.Result;
import com.example.notflix.data.model.LoggedInUser;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class LoginViewModel extends ViewModel {

    private final MutableLiveData<LoginFormState> loginFormState = new MutableLiveData<>();
    private final MutableLiveData<LoginResult> loginResult = new MutableLiveData<>();
    private final LoginRepository loginRepository;

    private String passwordError = "";

    LoginViewModel(LoginRepository loginRepository) {
        this.loginRepository = loginRepository;
    }

    LiveData<LoginFormState> getLoginFormState() {
        return loginFormState;
    }

    LiveData<LoginResult> getLoginResult() {
        return loginResult;
    }

    public void login(String username, String password) {
        loginRepository.login(username, password, new LoginDataSource.LoginCallback() {
            @Override
            public void onSuccess(Result<LoggedInUser> result) {
                // Cast to Result.Success and extract data
                if (result instanceof Result.Success) {
                    LoggedInUser user = ((Result.Success<LoggedInUser>) result).getData();
                    loginResult.postValue(new LoginResult(new LoggedInUserView(user.getDisplayName(), user.getUserId())));
                }
            }

            @Override
            public void onError(Result<LoggedInUser> result) {
                loginResult.postValue(new LoginResult(R.string.login_failed));
            }
        });
    }

    public void loginDataChanged(String username, String password) {
        // Checks that username is not empty
        if (!isUserNameValid(username)) {
            loginFormState.setValue(new LoginFormState(R.string.username_empty, null));
            return;
        }

        // Checks that password is not empty
        if (password == null || password.trim().isEmpty()) {
            loginFormState.setValue(new LoginFormState(null, R.string.password_empty));
            return;
        }

        // Checks that password is at least 8 characters
        if (password.trim().length() < 8) {
            loginFormState.setValue(new LoginFormState(null, R.string.password_too_short));
            return;
        }

        // Checks for 1 uppercase, lowercase, number, special character in password
//        if (!isPasswordValidRegex(password)) {
//            loginFormState.setValue(new LoginFormState(null, R.string.password_invalid_format));
//            return;
//        }

        // All validations passed
        loginFormState.setValue(new LoginFormState(true));
    }

    private boolean isUserNameValid(String username) {
        if (username == null) {
            return false;
        } else {
            return !username.trim().isEmpty();
        }
    }

    private boolean isPasswordValidRegex(String password) {
        String regex = "^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\\da-zA-Z]).{8,}$";

        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(password);

        return matcher.matches();
    }
}