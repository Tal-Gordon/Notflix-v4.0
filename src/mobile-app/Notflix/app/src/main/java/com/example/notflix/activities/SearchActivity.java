package com.example.notflix.activities;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.notflix.Entities.Movie;
import com.example.notflix.R;
import com.example.notflix.adapters.MovieAdapter;
import com.example.notflix.viewmodels.SearchViewModel;
import com.example.notflix.viewmodels.SearchViewModelFactory;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.snackbar.Snackbar;
import com.google.android.material.textfield.TextInputEditText;

import java.util.ArrayList;

public class SearchActivity extends AppCompatActivity implements MovieAdapter.OnMovieClickListener {
    private SearchViewModel searchViewModel;
    private MovieAdapter movieAdapter;
    private ProgressBar progressBar;
    private TextView noResultsText;
    private TextInputEditText searchInput;
    private String token;
    private View rootView; // Add this line to store the root view

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_search);

        // Get the root view of the activity
        rootView = findViewById(android.R.id.content); // Initialize rootView

        // Get token from intent
        token = getIntent().getStringExtra("TOKEN");
        if (token == null) {
            showSnackbar("Authentication error");
            finish();
            return;
        }

        // Initialize views
        MaterialToolbar toolbar = findViewById(R.id.toolbar);
        RecyclerView recyclerView = findViewById(R.id.search_results_recycler_view);
        progressBar = findViewById(R.id.progress_bar);
        noResultsText = findViewById(R.id.no_results_text);
        searchInput = findViewById(R.id.search_input);

        // Setup toolbar
        setSupportActionBar(toolbar);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        toolbar.setNavigationOnClickListener(v -> onBackPressed());

        // Setup RecyclerView
        movieAdapter = new MovieAdapter(new ArrayList<>(), this);
        recyclerView.setAdapter(movieAdapter);
        recyclerView.setLayoutManager(new GridLayoutManager(this, 3));

        // Setup ViewModel
        SearchViewModelFactory factory = new SearchViewModelFactory(getApplication());
        searchViewModel = new ViewModelProvider(this, factory).get(SearchViewModel.class);

        // Setup search input
        setupSearchInput();

        // Observe ViewModel
        observeViewModel();
    }

    private void setupSearchInput() {
        Log.d("Started searching", "LETS GO WE STARTED SEARCHING");
        searchInput.addTextChangedListener(new TextWatcher() {
            private Runnable searchRunnable;

            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                if (searchRunnable != null) {
                    searchInput.removeCallbacks(searchRunnable);
                }
            }

            @Override
            public void afterTextChanged(Editable s) {
                if (s.length() > 0) {
                    searchRunnable = () -> searchViewModel.performSearch(token, s.toString());
                    searchInput.postDelayed(searchRunnable, 300); // Debounce for 300ms
                } else {
                    movieAdapter.updateMovies(new ArrayList<>());
                    updateNoResultsVisibility(true);
                }
            }
        });
    }

    private void observeViewModel() {
        searchViewModel.getSearchResults().observe(this, movies -> {
            if (movies != null) {
                movieAdapter.updateMovies(movies);
                updateNoResultsVisibility(movies.isEmpty());
            }
        });

        searchViewModel.getIsSearching().observe(this, isSearching -> {
            progressBar.setVisibility(isSearching ? View.VISIBLE : View.GONE);
            if (isSearching) {
                noResultsText.setVisibility(View.GONE);
            }
        });

//        searchViewModel.getError().observe(this, error -> {
//            if (error != null) {
//                showSnackbar(error);
//            }
//        });
    }

    private void updateNoResultsVisibility(boolean shouldShow) {
        noResultsText.setVisibility(shouldShow ? View.VISIBLE : View.GONE);
    }

    @Override
    public void onMovieClick(Movie movie) {
        Intent intent = new Intent(this, WatchActivity.class);
        intent.putExtra("TOKEN", token);
        intent.putExtra("MOVIE_ID", movie.getMovieId());
        startActivity(intent);
    }

    private void showSnackbar(String message) {
        Snackbar snackbar = Snackbar.make(rootView, message, Snackbar.LENGTH_SHORT);

        View snackbarView = snackbar.getView();
        TextView textView = snackbarView.findViewById(com.google.android.material.R.id.snackbar_text);
        textView.setTextColor(getResources().getColor(android.R.color.white)); // Set text color

        snackbarView.setBackgroundColor(getResources().getColor(R.color.snackbar_background)); // Set background color (create this color in your colors.xml)

        snackbar.show();
    }
}