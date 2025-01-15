#include "Utility.h"

using std::string;
using std::vector;
using std::stringstream;
using std::unordered_map;
using std::pair;
using std::map;

// Returns true if the input is a number
bool Utility::isNumber(const string& str) {
    return !str.empty() && std::all_of(str.begin(), str.end(), ::isdigit);
}

// Splits a string by a given delimiter
vector<string> Utility::splitByDelimiter(const string& str, char delimiter) {
    vector<string> tokens;
    stringstream ss(str);
    string token;
    while (std::getline(ss, token, delimiter)) {
        tokens.push_back(token);
    }
    return tokens;
}

// Splits a string into lines
vector<string> Utility::splitByLine(const string& str) {
    return splitByDelimiter(str, '\n');
}

vector<string> Utility::sortMoviesByConnection(const unordered_map<string, int>& movieConnections) {
    vector<pair<string, int>> movies(movieConnections.begin(), movieConnections.end());

    // Custom sort logic
    std::sort(movies.begin(), movies.end(), [](const pair<string, int>& a, const pair<string, int>& b) {
        if (a.second != b.second) {
            return a.second > b.second; // Descending by connection strength
        }

        // Ascending by movie ID, parsing them as integers for numeric order
        int aMovieId = std::stoi(a.first);  // Convert string to integer for comparison
        int bMovieId = std::stoi(b.first);
        return aMovieId < bMovieId; // Ascending numeric order
    });

    // Extract sorted movie IDs
    vector<string> sortedMovies;
    for (const auto& movie : movies) {
        sortedMovies.push_back(movie.first);
    }

    return sortedMovies;
}


// Function to reorder the file data
string Utility::reorderFile(const string& fileData) {
    // Split the data into lines
    vector<string> lines = Utility::splitByLine(fileData);

    // Use a map to automatically sort users by numerical ID
    map<int, vector<int>> userMovies; // Changed key to int for numerical sorting

    for (const string& line : lines) {
        vector<string> tokens = Utility::splitByDelimiter(line, ' ');
        if (!tokens.empty()) {
            int userId = std::stoi(tokens[0]); // Convert user ID to integer
            vector<int> movies;
            for (size_t i = 1; i < tokens.size(); ++i) {
                movies.push_back(std::stoi(tokens[i])); // Convert movie IDs to integers
            }
            // Sort movies for this user
            std::sort(movies.begin(), movies.end());
            userMovies[userId] = movies;
        }
    }

    // Reconstruct the sorted data
    std::ostringstream reorderedData;
    for (const auto& [userId, movies] : userMovies) {
        reorderedData << userId; // Output user ID
        for (int movie : movies) {
            reorderedData << " " << movie; // Output movie IDs
        }
        reorderedData << "\n";
    }

    return reorderedData.str();
}
