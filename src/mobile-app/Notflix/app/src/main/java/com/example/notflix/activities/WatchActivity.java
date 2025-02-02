package com.example.notflix.activities;

import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;

import com.example.notflix.R;
import com.example.notflix.viewmodels.WatchViewModel;
import com.google.android.exoplayer2.MediaItem;
import com.google.android.exoplayer2.SimpleExoPlayer;
import com.google.android.exoplayer2.ui.PlayerView;

public class WatchActivity extends AppCompatActivity {
    private WatchViewModel watchViewModel;
    private ProgressBar progressBar;
    private SimpleExoPlayer player;
    private PlayerView playerView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        Log.d("WatchActivity", "Got to WatchActivity");
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_watch);

        initializeViews();
        initializePlayer();
        setupViewModel();
    }

    private void initializeViews() {
        playerView = findViewById(R.id.player_view);
        progressBar = findViewById(R.id.progress_bar);
    }

    private void initializePlayer() {
        player = new SimpleExoPlayer.Builder(this).build();
        playerView.setPlayer(player);
    }

    private void setupViewModel() {
        String token = getIntent().getStringExtra("TOKEN");
        String movieId = getIntent().getStringExtra("MOVIE_ID");

        if (token == null || movieId == null) {
            Toast.makeText(this, "Missing required data", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        watchViewModel = new ViewModelProvider(this).get(WatchViewModel.class);
        setupObservers();
        watchViewModel.fetchMovie(token, movieId);
    }

    private void setupObservers() {
        watchViewModel.getIsLoading().observe(this, isLoading -> {
            progressBar.setVisibility(isLoading ? View.VISIBLE : View.GONE);
            playerView.setVisibility(isLoading ? View.GONE : View.VISIBLE);
        });

        watchViewModel.getMovie().observe(this, movie -> {
            if (movie != null && movie.getVideo() != null) {
                setupVideoPlayer(movie.getVideo());
            }
        });

        watchViewModel.getError().observe(this, errorMessage -> {
            Toast.makeText(this, errorMessage, Toast.LENGTH_SHORT).show();
            finish();
        });
    }

    private void setupVideoPlayer(String videoPath) {
        // Construct full URL - same as for images
        String baseUrl = "http://10.0.2.2:3001/";
        Uri videoUri = Uri.parse(baseUrl + videoPath);

        MediaItem mediaItem = MediaItem.fromUri(videoUri);
        player.setMediaItem(mediaItem);
        player.prepare();
        player.play();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (player != null) {
            player.release();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (player != null) {
            player.pause();
        }
    }
}