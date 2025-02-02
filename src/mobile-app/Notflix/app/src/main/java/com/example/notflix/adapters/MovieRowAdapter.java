package com.example.notflix.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.notflix.R;
import com.example.notflix.Entities.Category;
import com.example.notflix.Entities.Movie;

import java.util.List;
import java.util.Map;

public class MovieRowAdapter extends RecyclerView.Adapter<MovieRowAdapter.CategoryViewHolder> {
    private final List<Category> categories;
    private final Map<String, List<Movie>> moviesByCategory;
    private final MovieAdapter.OnMovieClickListener movieClickListener;

    public MovieRowAdapter(List<Category> categories,
                           Map<String, List<Movie>> moviesByCategory,
                           MovieAdapter.OnMovieClickListener listener) {
        this.categories = categories;
        this.moviesByCategory = moviesByCategory;
        this.movieClickListener = listener;
    }

    @NonNull
    @Override
    public CategoryViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_category, parent, false);
        return new CategoryViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull CategoryViewHolder holder, int position) {
        Category category = categories.get(position);
        holder.categoryTitle.setText(category.getName());

        // Get movies for this category
        List<Movie> categoryMovies = moviesByCategory.get(category.getCategoryId());

        // Check if category has no movies
        if (categoryMovies == null || categoryMovies.isEmpty()) {
            // Hide the entire category item
            holder.itemView.setVisibility(View.GONE);
            holder.itemView.getLayoutParams().width = 0;
            holder.itemView.getLayoutParams().height = 0;
            return;
        } else {
            // Make sure category is visible (in case of recycled view)
            holder.itemView.setVisibility(View.VISIBLE);
            holder.itemView.getLayoutParams().width = ViewGroup.LayoutParams.MATCH_PARENT;
            holder.itemView.getLayoutParams().height = ViewGroup.LayoutParams.WRAP_CONTENT;
        }

        // Only create new adapter if necessary
        if (holder.moviesRecyclerView.getAdapter() == null) {
            MovieAdapter movieAdapter = new MovieAdapter(categoryMovies, movieClickListener);
            holder.moviesRecyclerView.setAdapter(movieAdapter);
        } else {
            // Update existing adapter
            ((MovieAdapter) holder.moviesRecyclerView.getAdapter()).updateMovies(categoryMovies);
        }

        // Initialize layout manager if needed
        if (holder.moviesRecyclerView.getLayoutManager() == null) {
            holder.moviesRecyclerView.setLayoutManager(
                    new LinearLayoutManager(holder.itemView.getContext(),
                            LinearLayoutManager.HORIZONTAL, false)
            );
        }
    }
    @Override
    public int getItemCount() {
        return categories != null ? categories.size() : 0;
    }

    public void updateData(List<Category> newCategories, Map<String, List<Movie>> newMoviesByCategory) {
        this.categories.clear();
        if (newCategories != null) {
            this.categories.addAll(newCategories);
        }
        this.moviesByCategory.clear();
        if (newMoviesByCategory != null) {
            this.moviesByCategory.putAll(newMoviesByCategory);
        }
        notifyDataSetChanged();
    }

    static class CategoryViewHolder extends RecyclerView.ViewHolder {
        TextView categoryTitle;
        RecyclerView moviesRecyclerView;

        public CategoryViewHolder(@NonNull View itemView) {
            super(itemView);
            categoryTitle = itemView.findViewById(R.id.category_title);
            moviesRecyclerView = itemView.findViewById(R.id.movies_recycler_view);
        }
    }
}