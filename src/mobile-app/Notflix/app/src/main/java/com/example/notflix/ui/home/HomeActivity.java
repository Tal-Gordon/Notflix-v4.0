package com.example.notflix.ui.home;

import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.example.notflix.R;
import com.example.notflix.data.model.Movie;

import java.util.ArrayList;
import java.util.HashMap;

public class HomeActivity extends AppCompatActivity implements MovieAdapter.OnMovieClickListener {
    private HomeViewModel homeViewModel;
    private CategoryAdapter categoryAdapter;
    private SwipeRefreshLayout swipeRefresh;
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home);

        // Initialize Views
        RecyclerView categoriesRecyclerView = findViewById(R.id.categories_recycler_view);
        swipeRefresh = findViewById(R.id.swipe_refresh);
        progressBar = findViewById(R.id.progress_bar);

        // Setup RecyclerView
        categoryAdapter = new CategoryAdapter(new ArrayList<>(), new HashMap<>(), this);
        categoriesRecyclerView.setAdapter(categoryAdapter);
        categoriesRecyclerView.setLayoutManager(new LinearLayoutManager(this));

        // Setup ViewModel
        HomeViewModelFactory factory = new HomeViewModelFactory(getApplication());
        homeViewModel = new ViewModelProvider(this, factory).get(HomeViewModel.class);

        // Observe data changes
        homeViewModel.getHomeData().observe(this, homeData -> {
            if (homeData != null) {
                categoryAdapter.updateData(homeData.getCategories(), homeData.getMoviesByCategory());
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
    public void onMovieClick(Movie movie) {
        // Simple click handling for now
        Log.d("MovieClick", "Clicked on: " + movie.getTitle());
        Toast.makeText(this, "Clicked: " + movie.getTitle(), Toast.LENGTH_SHORT).show();
    }
}