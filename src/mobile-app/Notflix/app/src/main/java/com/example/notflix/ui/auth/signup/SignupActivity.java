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

import com.example.notflix.data.AppDatabase;
import com.example.notflix.databinding.ActivitySignupBinding;
import com.example.notflix.ui.auth.LoggedInUserView;
import com.example.notflix.ui.home.HomeActivity;

public class SignupActivity extends AppCompatActivity {

    private SignupViewModel signupViewModel;
    private ActivitySignupBinding binding;
    AppDatabase db;

    EditText usernameEditText;
    EditText passwordEditText;
    EditText nameEditText;
    EditText surnameEditText;
    Button signupButton;
    ProgressBar loadingProgressBar;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        binding = ActivitySignupBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        Application application = getApplication();
        db = AppDatabase.getInstance(application);

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

            //Complete and destroy login activity once successful
            finish();
        });
    }

    private void updateUiWithUser(LoggedInUserView model) {
        db.userDao().getLoggedInUser()
                .observe(this, userEntity -> {
                    startActivity(new Intent(this, HomeActivity.class));
                    // to get username: model.getUsername();
                    // to get token: userEntity.getToken();
                    // TODO : initiate successful logged in experience
                });
    }

    private void showSignupFailed(@StringRes Integer errorString) {
        // TODO : initiate error
    }
}