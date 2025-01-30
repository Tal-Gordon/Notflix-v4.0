package com.example.notflix.ui.home;


import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;

import com.example.notflix.R;



public class HomeActivity extends AppCompatActivity {
    private HomeViewModel homeViewModel;
    private String token; // Get from login

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home);

        // Retrieve userId from Intent
        token = getIntent().getStringExtra("USER_ID");

        // Initialize ViewModel with Factory
        HomeViewModelFactory factory = new HomeViewModelFactory(getApplication(), token);
        homeViewModel = new ViewModelProvider(this, factory).get(HomeViewModel.class);

        // Observe LiveData
        homeViewModel.getHomeData().observe(this, homeData -> {
            // Update UI
        });

        // Trigger data refresh
        homeViewModel.refreshMovies(token);
    }
}