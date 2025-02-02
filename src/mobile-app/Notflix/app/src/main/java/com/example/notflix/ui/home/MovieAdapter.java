// MovieAdapter.java
package com.example.notflix.ui.home;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.example.notflix.R;
import com.example.notflix.data.model.Movie;

import java.util.List;

public class MovieAdapter extends RecyclerView.Adapter<MovieAdapter.MovieViewHolder> {
    private final List<Movie> movies;
    private final OnMovieClickListener clickListener;

    public MovieAdapter(List<Movie> movies, OnMovieClickListener listener) {
        this.movies = movies;
        this.clickListener = listener;
    }

    @NonNull
    @Override
    public MovieViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_movie, parent, false);
        return new MovieViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull MovieViewHolder holder, int position) {
        Movie movie = movies.get(position);
        holder.bind(movie, clickListener);
    }

    @Override
    public int getItemCount() {
        return movies != null ? movies.size() : 0;
    }

    static class MovieViewHolder extends RecyclerView.ViewHolder {
        private final ImageView movieImage;
        private final TextView movieTitle;

        public MovieViewHolder(@NonNull View itemView) {
            super(itemView);
            movieImage = itemView.findViewById(R.id.movie_image);
            movieTitle = itemView.findViewById(R.id.movie_title);
        }

        void bind(Movie movie, OnMovieClickListener listener) {
            movieTitle.setText(movie.getTitle());

            // Load movie thumbnail
            if (movie.getPicture() != null && !movie.getPicture().isEmpty()) {
                Glide.with(itemView)
                        .load("http://localhost:3001/" + movie.getPicture()) // need to change for the correct file path
                        .placeholder(R.drawable.movie_placeholder) // Create a placeholder drawable
                        .error(R.drawable.movie_error) // Create an error drawable
                        .into(movieImage);
            } else {
                movieImage.setImageResource(R.drawable.movie_placeholder);
            }

            itemView.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onMovieClick(movie);
                }
            });
        }
    }

    public void updateMovies(List<Movie> newMovies) {
        this.movies.clear();
        this.movies.addAll(newMovies);
        notifyDataSetChanged();
    }

    public interface OnMovieClickListener {
        void onMovieClick(Movie movie);
    }
}