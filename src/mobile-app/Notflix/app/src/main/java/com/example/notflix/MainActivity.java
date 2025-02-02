package com.example.notflix;

import android.content.Intent;
import android.os.Bundle;
import android.widget.TextView;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.example.notflix.databinding.ActivityMainBinding;
import com.example.notflix.activities.LoginActivity;
import com.example.notflix.activities.SignupActivity;

public class MainActivity extends AppCompatActivity {

    private static MainActivity instance;
    private ActivityMainBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        binding = ActivityMainBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());
        ViewCompat.setOnApplyWindowInsetsListener(binding.main, (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        binding.btnLogin.setOnClickListener(view -> startActivity(new Intent(this, LoginActivity.class)));
        binding.btnSignup.setOnClickListener(view -> startActivity(new Intent(this, SignupActivity.class)));

        instance = this;
    }

    public static MainActivity getInstance() {
        return instance;
    }

    public void SetLoginTextView(String message)
    {
        TextView loggedInText = binding.loginInfoText;
        loggedInText.setText(message);
    }
}