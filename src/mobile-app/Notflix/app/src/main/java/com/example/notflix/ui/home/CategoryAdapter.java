package com.example.notflix.ui.home;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.example.notflix.R;
import com.example.notflix.data.model.CategoryEntity;
import com.example.notflix.data.model.MovieEntity;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class CategoryAdapter extends RecyclerView.Adapter<CategoryAdapter.CategoryViewHolder> {
    private final List<CategoryEntity> categories;
    private final Map<String, List<MovieEntity>> moviesByCategory;
    private final MovieAdapter.OnMovieClickListener movieClickListener;

    public CategoryAdapter(List<CategoryEntity> categories,
                           Map<String, List<MovieEntity>> moviesByCategory,
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
        CategoryEntity category = categories.get(position);
        holder.categoryTitle.setText(category.getName());

        // Get movies for this category
        List<MovieEntity> categoryMovies = moviesByCategory.get(category.getCategoryId());
        if (categoryMovies == null) {
            categoryMovies = new ArrayList<>();
        }

        // Create and set up the movie adapter
        MovieAdapter movieAdapter = new MovieAdapter(categoryMovies, movieClickListener);
        holder.moviesRecyclerView.setAdapter(movieAdapter);

        // Set up horizontal scrolling for movies
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

    public void updateData(List<CategoryEntity> newCategories, Map<String, List<MovieEntity>> newMoviesByCategory) {
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