package com.example.notflix.ui.home;


import android.os.Bundle;
import android.util.Log;

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

        // Initialize ViewModel with Factory
        HomeViewModelFactory factory = new HomeViewModelFactory(getApplication());
        homeViewModel = new ViewModelProvider(this, factory).get(HomeViewModel.class);

        homeViewModel.refreshMovies();
        // Observe LiveData
        homeViewModel.getHomeData().observe(this, homeData -> {
            Log.d("HomeActivity data", homeData.toString());
            // Update UI
        });
    }
}