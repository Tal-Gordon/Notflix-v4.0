package com.example.notflix.activities;

import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.example.notflix.R;
import com.example.notflix.adapters.MovieRowAdapter;
import com.example.notflix.adapters.MovieAdapter;
import com.example.notflix.Entities.Movie;
import com.example.notflix.viewmodels.HomeViewModel;
import com.example.notflix.viewmodels.HomeViewModelFactory;
import com.google.android.material.appbar.MaterialToolbar;

import java.util.ArrayList;
import java.util.HashMap;

public class HomeActivity extends AppCompatActivity implements MovieAdapter.OnMovieClickListener {
    private HomeViewModel homeViewModel;
    private MovieRowAdapter movieRowAdapter;
    private SwipeRefreshLayout swipeRefresh;
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home);

        // Initialize Toolbar
        MaterialToolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        // Initialize Views
        RecyclerView categoriesRecyclerView = findViewById(R.id.categories_recycler_view);
        swipeRefresh = findViewById(R.id.swipe_refresh);
        progressBar = findViewById(R.id.progress_bar);

        // Setup RecyclerView
        movieRowAdapter = new MovieRowAdapter(new ArrayList<>(), new HashMap<>(), this);
        categoriesRecyclerView.setAdapter(movieRowAdapter);
        categoriesRecyclerView.setLayoutManager(new LinearLayoutManager(this));

        // Setup ViewModel
        HomeViewModelFactory factory = new HomeViewModelFactory(getApplication());
        homeViewModel = new ViewModelProvider(this, factory).get(HomeViewModel.class);

        // Observe data changes
        homeViewModel.getHomeData().observe(this, homeData -> {
            if (homeData != null) {
                movieRowAdapter.updateData(homeData.getCategories(), homeData.getMoviesByCategory());
            }
        });

        // Observe loading state
        homeViewModel.getIsLoading().observe(this, isLoading -> {
            progressBar.setVisibility(isLoading ? View.VISIBLE : View.GONE);
            swipeRefresh.setRefreshing(isLoading);
        });

        // Setup swipe-to-refresh
        swipeRefresh.setOnRefreshListener(() -> homeViewModel.refreshMovies());

        // Initial load
        homeViewModel.refreshMovies();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.home_toolbar, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == R.id.action_logout) {
            homeViewModel.logout();
            navigateToLogin();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    private void navigateToLogin() {
        // Replace with your login activity navigation
        finish(); // Close current activity
        // Add any login navigation logic here
        Toast.makeText(this, "Logged out successfully", Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onMovieClick(Movie movie) {
        // Simple click handling for now
        Log.d("MovieClick", "Clicked on: " + movie.getTitle());
        Toast.makeText(this, "Clicked: " + movie.getTitle(), Toast.LENGTH_SHORT).show();
    }
}