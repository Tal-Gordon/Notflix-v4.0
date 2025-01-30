package com.example.notflix.ui.home;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.notflix.R;
import com.example.notflix.data.model.MovieEntity;

import java.util.List;

public class MovieAdapter extends RecyclerView.Adapter<MovieAdapter.MovieViewHolder> {

    private List<MovieEntity> movieList;

    public MovieAdapter(List<MovieEntity> movieList) {
        this.movieList = movieList;
    }

    @NonNull
    @Override
    public MovieViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.movie_item, parent, false);
        return new MovieViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull MovieViewHolder holder, int position) {
        MovieEntity movie = movieList.get(position);
        holder.movieTitleTextView.setText(movie.getTitle());
    }

    @Override
    public int getItemCount() {
        return movieList == null ? 0 : movieList.size();
    }

    public void setMovieList(List<MovieEntity> movieList) {
        this.movieList = movieList;
        notifyDataSetChanged();
    }

    static class MovieViewHolder extends RecyclerView.ViewHolder {
        TextView movieTitleTextView;

        public MovieViewHolder(@NonNull View itemView) {
            super(itemView);
            movieTitleTextView = itemView.findViewById(R.id.movieTitleTextView);
        }
    }
}