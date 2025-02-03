package com.example.notflix.ui.auth.signup;

import android.app.Activity;
import android.app.Application;
import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;

import androidx.annotation.StringRes;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;

import com.example.notflix.databinding.ActivitySignupBinding;
import com.example.notflix.ui.auth.LoggedInUserView;
import com.example.notflix.ui.home.HomeActivity;
import com.google.android.material.snackbar.Snackbar;

public class SignupActivity extends AppCompatActivity {

    private SignupViewModel signupViewModel;
    private ActivitySignupBinding binding;

    EditText usernameEditText;
    EditText passwordEditText;
    EditText nameEditText;
    EditText surnameEditText;
    Button signupButton;
    ProgressBar loadingProgressBar;
    private Snackbar snackbar;


    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        binding = ActivitySignupBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        Application application = getApplication();

        signupViewModel = new ViewModelProvider(this, new SignupViewModelFactory(application))
                .get(SignupViewModel.class);

        usernameEditText = binding.username;
        passwordEditText = binding.password;
        nameEditText = binding.name;
        surnameEditText = binding.surname;
        signupButton = binding.btnSignup;
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
                signupViewModel.signupDataChanged(usernameEditText.getText().toString(),
                        passwordEditText.getText().toString());
            }
        };
        usernameEditText.addTextChangedListener(afterTextChangedListener);
        passwordEditText.addTextChangedListener(afterTextChangedListener);
        passwordEditText.setOnEditorActionListener((v, actionId, event) -> {
            if (actionId == EditorInfo.IME_ACTION_DONE) {
                signupViewModel.Signup(
                        usernameEditText.getText().toString(),
                        passwordEditText.getText().toString(),
                        nameEditText.getText().toString(),
                        surnameEditText.getText().toString());
            }
            return false;
        });

        signupButton.setOnClickListener(view -> {
            loadingProgressBar.setVisibility(View.VISIBLE);
            signupViewModel.Signup(usernameEditText.getText().toString(),
                                    passwordEditText.getText().toString(),
                                    nameEditText.getText().toString(),
                                    surnameEditText.getText().toString());
        });
    }

    private void setupObservers() {
        signupViewModel.getSignupFormState().observe(this, loginFormState -> {
            if (loginFormState == null) {
                return;
            }
            signupButton.setEnabled(loginFormState.isDataValid());
            if (loginFormState.getUsernameError() != null) {
                usernameEditText.setError(getString(loginFormState.getUsernameError()));
            }
            if (loginFormState.getPasswordError() != null) {
                passwordEditText.setError(getString(loginFormState.getPasswordError()));
            }
        });

        signupViewModel.getSignupResult().observe(this, loginResult -> {
            if (loginResult == null) {
                return;
            }
            loadingProgressBar.setVisibility(View.GONE);
            if (loginResult.getError() != null) {
                showSignupFailed(loginResult.getError());
            }
            if (loginResult.getSuccess() != null) {
                updateUiWithUser(loginResult.getSuccess());
            }
            setResult(Activity.RESULT_OK);
        });
    }

    private void updateUiWithUser(LoggedInUserView model) {
        if (snackbar != null && snackbar.isShown()) {
            snackbar.dismiss();
        }

        Intent intent = new Intent(this, HomeActivity.class);
        intent.putExtra("USERNAME", model.getUsername());
        intent.putExtra("TOKEN", model.getToken());

         startActivity(intent);
         finish();
    }

    private void showSignupFailed(@StringRes Integer errorString) {
        if (snackbar == null) {
            snackbar = Snackbar.make(binding.getRoot(), getString(errorString), Snackbar.LENGTH_LONG);
            snackbar.setAction("Dismiss", v -> snackbar.dismiss());
        } else {
            snackbar.setText(getString(errorString));
        }

        snackbar.show();
    }
}