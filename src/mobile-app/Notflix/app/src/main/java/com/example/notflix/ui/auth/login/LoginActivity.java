package com.example.notflix.ui.auth.login;

import android.app.Activity;
import android.app.Application;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;

import androidx.annotation.StringRes;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;

import com.example.notflix.MainActivity;
import com.example.notflix.R;
import com.example.notflix.data.AppDatabase;
import com.example.notflix.data.UserRepository;
import com.example.notflix.databinding.ActivityLoginBinding;
import com.example.notflix.ui.auth.LoggedInUserView;
import com.google.android.material.snackbar.Snackbar;

public class LoginActivity extends AppCompatActivity {

    private LoginViewModel loginViewModel;
    private ActivityLoginBinding binding;

    EditText usernameEditText;
    EditText passwordEditText;
    Button loginButton;
    ProgressBar loadingProgressBar;
    private Snackbar snackbar;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        binding = ActivityLoginBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        Application application = getApplication();

//        getApplicationContext().deleteDatabase("notflix-db"); // for resetting the database

        loginViewModel = new ViewModelProvider(this, new LoginViewModelFactory(application))
                .get(LoginViewModel.class);

        usernameEditText = binding.username;
        passwordEditText = binding.password;
        loginButton = binding.login;
        loadingProgressBar = binding.loading;

        setupObservers();

        TextWatcher afterTextChangedListener = new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
                // ignore
            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                // ignore
            }

            @Override
            public void afterTextChanged(Editable s) {
                loginViewModel.loginDataChanged(usernameEditText.getText().toString(),
                        passwordEditText.getText().toString());
            }
        };
        usernameEditText.addTextChangedListener(afterTextChangedListener);
        passwordEditText.addTextChangedListener(afterTextChangedListener);
        passwordEditText.setOnEditorActionListener((v, actionId, event) -> {
            if (actionId == EditorInfo.IME_ACTION_DONE) {
                loginViewModel.login(usernameEditText.getText().toString(),
                        passwordEditText.getText().toString());
            }
            return false;
        });

        loginButton.setOnClickListener(view -> {
            InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
            if (imm != null) {
                imm.hideSoftInputFromWindow(view.getWindowToken(), 0);
            }
            loadingProgressBar.setVisibility(View.VISIBLE);
            loginViewModel.login(usernameEditText.getText().toString(),
                    passwordEditText.getText().toString());
        });

        attemptAutoLogin(application);
    }

    private void setupObservers() {
        loginViewModel.getLoginFormState().observe(this, loginFormState -> {
            if (loginFormState == null) {
                return;
            }
            loginButton.setEnabled(loginFormState.isDataValid());
            if (loginFormState.getUsernameError() != null) {
                usernameEditText.setError(getString(loginFormState.getUsernameError()));
            }
            if (loginFormState.getPasswordError() != null) {
                passwordEditText.setError(getString(loginFormState.getPasswordError()));
            }
        });

        loginViewModel.getLoginResult().observe(this, loginResult -> {
            if (loginResult == null) {
                return;
            }
            loadingProgressBar.setVisibility(View.GONE);
            if (loginResult.getError() != null) {
                showLoginFailed(loginResult.getError());
            }
            if (loginResult.getSuccess() != null) {
                updateUiWithUser(loginResult.getSuccess());
            }
            setResult(Activity.RESULT_OK);
        });
    }

    private void attemptAutoLogin(Application application) {
        UserRepository userRepository = new UserRepository(application);
        userRepository.getLoggedInUser().observe(this, user -> {
            if (user != null && user.isLoggedIn()) {
                Log.d("AutoLogin", "yes");
//              Intent intent = new Intent(this, HomeActivity.class);
//              intent.putExtra("USERNAME", user.getUsername());
//              intent.putExtra("TOKEN", user.getToken());

//              startActivity(intent);
//              finish();
            }
        });
    }

    private void updateUiWithUser(LoggedInUserView model) {
        if (snackbar != null && snackbar.isShown()) {
            snackbar.dismiss();
        }

//        Intent intent = new Intent(this, HomeActivity.class);
//        intent.putExtra("USERNAME", model.getUsername());
//        intent.putExtra("TOKEN", model.getToken());

//         startActivity(intent);
//         finish();
    }

    private void showLoginFailed(@StringRes Integer errorString) {
        if (snackbar == null) {
            snackbar = Snackbar.make(binding.getRoot(), getString(errorString), Snackbar.LENGTH_LONG);
            snackbar.setAction("Dismiss", v -> snackbar.dismiss());
        } else {
            snackbar.setText(getString(errorString));
        }

        snackbar.show();
    }
}