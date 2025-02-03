package com.example.notflix.data.model.response;

import com.example.notflix.Entities.Movie;
import java.util.List;

public class MovieListResponse {
    private List<Movie> results;
    private String error;

    public List<Movie> getResults() { return results; }
    public String getError() { return error; }
}