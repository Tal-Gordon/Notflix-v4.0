package com.example.notflix.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.example.notflix.Entities.Movie;
import com.example.notflix.R;
import com.example.notflix.adapters.MovieAdapter;
import com.example.notflix.adapters.MovieRowAdapter;
import com.example.notflix.data.repositories.CategoryRepository;
import com.example.notflix.databinding.ActivityMovieInfoBinding;
import com.example.notflix.viewmodels.MovieInfoViewModel;

import java.util.ArrayList;
import java.util.List;

public class MovieInfoActivity extends AppCompatActivity implements MovieAdapter.OnMovieClickListener {
    private MovieRowAdapter movieRowAdapter;
    private ProgressBar progressBar;
    private ActivityMovieInfoBinding binding;
    private MovieInfoViewModel movieInfoViewModel;
    private CategoryRepository categoryRepository;
    private MovieAdapter movieAdapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        binding = ActivityMovieInfoBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        categoryRepository = new CategoryRepository(getApplication());

        setupViewModel();
        setupObservers();

        // Back button setup
        binding.btnBack.setOnClickListener(v -> finish());

        // Initialize recommendations components
        progressBar = binding.progressBar;
        RecyclerView recyclerView = binding.recyclerView;

        GridLayoutManager layoutManager = new GridLayoutManager(this, 3);
        recyclerView.setLayoutManager(layoutManager);

        movieAdapter = new MovieAdapter(new ArrayList<>(), this);
        recyclerView.setAdapter(movieAdapter);
}

    private void setupViewModel() {
        String token = getIntent().getStringExtra("TOKEN");
        String movieId = getIntent().getStringExtra("MOVIE_ID");

        if (token == null || movieId == null) {
            Toast.makeText(this, "Missing required data", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        movieInfoViewModel = new ViewModelProvider(this).get(MovieInfoViewModel.class);
        movieInfoViewModel.fetchMovie(token, movieId);
        movieInfoViewModel.getRecommendations(token, movieId);
    }

    private void setupObservers() {
        movieInfoViewModel.getIsLoading().observe(this, isLoading -> {
            progressBar.setVisibility(isLoading ? View.VISIBLE : View.GONE);
            binding.main.setVisibility(isLoading ? View.GONE : View.VISIBLE);
        });

        movieInfoViewModel.getMovie().observe(this, movie -> {
            if (movie != null) {
                updateMovieInfo(movie);
            }
        });

        movieInfoViewModel.getError().observe(this, errorMessage -> {
            Toast.makeText(this, errorMessage, Toast.LENGTH_SHORT).show();
            finish();
        });

        movieInfoViewModel.getRecommendationsResults().observe(this, recommendedMovies -> {
            List<Movie> safeList = recommendedMovies != null ? recommendedMovies : new ArrayList<>();

            movieAdapter.updateMovies(safeList);
        });
    }

    private void updateMovieInfo(Movie movie) {
        // Set basic info
        binding.movieTitle.setText(movie.getTitle());
        binding.movieDescription.setText(movie.getDescription());

        ImageView movieImage = binding.movieImage;
        String imageUrl = "http://10.0.2.2:3001/" + movie.getPicture();
        Glide.with(this)
                .load(imageUrl)
                .centerCrop()
                .into(movieImage);


        // Handle categories with repository
        List<String> categoryIds = movie.getCategoryIds();
        List<String> categoryNames = new ArrayList<>();

        if (categoryIds != null && !categoryIds.isEmpty()) {
            for (String categoryId : categoryIds) {
                categoryRepository.getCategoryById(categoryId).observe(this, category -> {
                    if (category != null) {
                        categoryNames.add(category.getName());
                        if (categoryNames.size() == categoryIds.size()) {
                            binding.movieCategories.setText(getString(R.string.categories_format,
                                    formatList(categoryNames, "No categories")));
                        }
                    }
                });

            }
        }else{
            binding.movieCategories.setText(getString(R.string.categories_format,
                    "No categories"));
        }

        // Format lists into comma-separated strings
        List<String> actors = movie.getActors();
        List<String> directors = movie.getDirectors();

        binding.movieActors.setText(getString(R.string.cast_format,
                formatList(actors, "No actors information")));

        binding.movieDirectors.setText(getString(R.string.directors_format,
                formatList(directors, "No director information")));

        // Handle video availability
        if (movie.getVideo() != null && !movie.getVideo().isEmpty()) {
            binding.btnWatch.setEnabled(true);
            binding.btnWatch.setOnClickListener(v -> startWatchActivity(movie));
        }
    }

    private String formatList(List<String> items, String defaultText) {
        if (items == null || items.isEmpty()) {
            return defaultText;
        }
        return String.join(", ", items);
    }

    @Override
    public void onMovieClick(Movie movie) {
        String token = getIntent().getStringExtra("TOKEN");
        if (token != null) {
            Intent intent = new Intent(this, MovieInfoActivity.class);
            intent.putExtra("TOKEN", token);
            intent.putExtra("MOVIE_ID", movie.getMovieId());
            startActivity(intent);
        } else {
            Toast.makeText(this, "Authentication error", Toast.LENGTH_SHORT).show();
        }
    }

    public void startWatchActivity(Movie movie) {
        String token = getIntent().getStringExtra("TOKEN");
        if (token != null) {
            Intent intent = new Intent(this, WatchActivity.class);
            intent.putExtra("TOKEN", token);
            intent.putExtra("MOVIE_ID", movie.getMovieId());
            startActivity(intent);
        } else {
            Toast.makeText(this, "Authentication error", Toast.LENGTH_SHORT).show();
        }
    }
}