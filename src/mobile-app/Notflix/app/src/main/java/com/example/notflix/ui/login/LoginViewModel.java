package com.example.notflix.ui.login;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.example.notflix.R;
import com.example.notflix.data.UserDataSource;
import com.example.notflix.data.LoginRepository;
import com.example.notflix.data.Result;
import com.example.notflix.data.model.ErrorMapper;
import com.example.notflix.data.model.LoggedInUser;

import java.util.regex.Matcher;
import java.util.regex.Pattern;
/**
 * The {@code LoginViewModel} class is responsible for managing the data and business logic
 * related to user login in the UI layer. It provides observable LiveData to update the UI
 * based on user interactions and authentication results.
 *
 * <p>This class integrates with the {@link LoginRepository} to handle authentication processes
 * and performs form validation to ensure correct user input.
 *
 * <p>Main features of this ViewModel:
 * <ul>
 *     <li>Validates username and password input with real-time feedback.</li>
 *     <li>Handles login requests and processes success or failure responses.</li>
 *     <li>Maps backend error messages to user-friendly string resources via {@link ErrorMapper}.</li>
 *     <li>Provides LiveData to observe the state of the login form and login results.</li>
 * </ul>
 */

public class LoginViewModel extends ViewModel {

    private final MutableLiveData<LoginFormState> loginFormState = new MutableLiveData<>();
    private final MutableLiveData<LoginResult> loginResult = new MutableLiveData<>();
    private final LoginRepository loginRepository;

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
        loginRepository.login(username, password, new UserDataSource.LoginCallback() {
            @Override
            public void onSuccess(Result<LoggedInUser> result) {
                // Handle UI updates
                if (result instanceof Result.Success) {
                    LoggedInUser user = ((Result.Success<LoggedInUser>) result).getData();
                    loginResult.postValue(new LoginResult(new LoggedInUserView(user.getUsername())));
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
                loginResult.postValue(new LoginResult(errorResId));
            }
        });
    }

    public void loginDataChanged(String username, String password) {
        // Checks that username is not empty
        if (isInputNotValid(username)) {
            loginFormState.setValue(new LoginFormState(R.string.username_empty, null));
            return;
        }

        // Checks that password is not empty
        if (isInputNotValid(password)) {
            loginFormState.setValue(new LoginFormState(null, R.string.password_empty));
            return;
        }

        // All validations passed
        loginFormState.setValue(new LoginFormState(true));
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