package com.example.notflix.ui.home;

import android.content.Context;
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

    private List<CategoryEntity> categoryList;
    private Context context;
    private Map<String, List<MovieEntity>> movieMap;

    public CategoryAdapter(Context context, List<CategoryEntity> categoryList, Map<String, List<MovieEntity>> movieMap) {
        this.categoryList = categoryList;
        this.context = context;
        this.movieMap = movieMap;
    }

    @NonNull
    @Override
    public CategoryViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.category_item, parent, false);
        return new CategoryViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull CategoryViewHolder holder, int position) {
        CategoryEntity category = categoryList.get(position);
        holder.categoryNameTextView.setText(category.getName());

        List<MovieEntity> moviesForCategory = movieMap.get(category.getCategoryId());
        MovieAdapter movieAdapter = new MovieAdapter(moviesForCategory != null ? moviesForCategory : new ArrayList<>());
        holder.movieRecyclerView.setLayoutManager(new LinearLayoutManager(context, LinearLayoutManager.HORIZONTAL, false));
        holder.movieRecyclerView.setAdapter(movieAdapter);
    }


    @Override
    public int getItemCount() {
        return categoryList == null ? 0 : categoryList.size();
    }

    public void setCategoryList(List<CategoryEntity> categoryList) {
        this.categoryList = categoryList;
        notifyDataSetChanged();
    }

    static class CategoryViewHolder extends RecyclerView.ViewHolder {
        TextView categoryNameTextView;
        RecyclerView movieRecyclerView;

        public CategoryViewHolder(@NonNull View itemView) {
            super(itemView);
            categoryNameTextView = itemView.findViewById(R.id.categoryNameTextView);
            movieRecyclerView = itemView.findViewById(R.id.movieRecyclerView);
        }
    }
}