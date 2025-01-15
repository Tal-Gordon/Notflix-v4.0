#include "GetCommand.h"

using std::string;
using std::vector;
using std::stringstream;

// Validates the input arguments
std::pair<bool, string> GetCommand::isInputValid(const vector<string>& args) const {
    // Validate input size
    if (args.size() != 2) {
        return {false, "400 Bad Request"};
    }

    // Validate that both inputs are numeric
    if (!Utility::isNumber(args[0]) || !Utility::isNumber(args[1])) {
        return {false, "400 Bad Request"};
    }

    // Retrieve file data
    string fileData = fileIO.read();

    // Split data by line
    vector<string> lines = Utility::splitByLine(fileData);

    // Flags for existence
    bool userExists = false;
    bool movieExists = false;

    // Iterate over lines to check existence of user and movie
    for (const string& line : lines) {
        vector<string> tokens = Utility::splitByDelimiter(line, ' ');

        // Check if the user exists
        if (!tokens.empty() && tokens[0] == args[0]) {
            userExists = true;
        }

        // Check if the movie exists in this line
        if (std::find(tokens.begin() + 1, tokens.end(), args[1]) != tokens.end()) {
            movieExists = true;
        }

        // If both exist, no need to continue
        if (userExists && movieExists) {
            return {true, "200 Ok"};
        }
    }

    // Determine the specific validation error
    if (!userExists) {
        return {false, "404 Not Found"};
    }
    if (!movieExists) {
        return {false, "404 Not Found"};
    }

    return {false, "400 Bad Request"};
}

// Parse data into a map of user to movies
unordered_map<string, unordered_set<string>> GetCommand::parseData(const vector<string>& data) const {
    unordered_map<string, unordered_set<string>> userToMovies;
    for (const auto& line : data) {
        vector<string> tokens = Utility::splitByDelimiter(line, ' ');
        if (!tokens.empty()) {
            string user = tokens[0];
            unordered_set<string> movies(tokens.begin() + 1, tokens.end());
            userToMovies[user] = movies;
        }
    }
    return userToMovies;
}

// Identify relevant users (users who watched the given movieId)
unordered_set<string> GetCommand::getRelevantUsers(const unordered_map<string, unordered_set<string>>& userToMovies, const string& userId, const string& movieId) const {
    unordered_set<string> relevantUsers;
    for (const auto& [otherUserId, movies] : userToMovies) {
        if (otherUserId != userId && movies.count(movieId)) {
            relevantUsers.insert(otherUserId);
        }
    }
    return relevantUsers;
}

// Calculate connection strength for each relevant user
unordered_map<string, int> GetCommand::getUserConnections(const unordered_set<string>& relevantUsers, const unordered_map<string, unordered_set<string>>& userToMovies, const string& userId, const string& movieId) const {
    unordered_map<string, int> userConnections;
    for (const auto& otherUserId : relevantUsers) {
        if (otherUserId == userId) continue; // Skip the target user

        const auto& otherUserMovies = userToMovies.at(otherUserId);
        int connectionStrength = 0;

        // Iterate through the other user's movies
        for (const auto& movie : otherUserMovies) {
            // Only count the movie if it's not the given movieId and is in the current user's movie set
            if (movie != movieId && userToMovies.at(userId).count(movie)) {
                ++connectionStrength; // Count shared movies
            }
        }

        //if (connectionStrength > 0) { -----------------if i ever decide to not recommend movies with 0 connection----------
            userConnections[otherUserId] = connectionStrength;
        //}
    }
    return userConnections;
}

// Calculate movie connections for movies not yet watched by userId
unordered_map<string, int> GetCommand::getMovieConnections(const unordered_map<string, int>& userConnections, const unordered_map<string, unordered_set<string>>& userToMovies, const string& userId, const string& movieId) const {
    unordered_map<string, int> movieConnections;
    for (const auto& [otherUserId, connectionStrength] : userConnections) {
        for (const auto& movie : userToMovies.at(otherUserId)) {
            // Exclude movies the user has already watched and the given movieId
            if (!userToMovies.at(userId).count(movie) && movie != movieId) {
                movieConnections[movie] += connectionStrength;
            }
        }
    }
    return movieConnections;
}

// Generate the recommendation
string GetCommand::generateRecommendation(const string& userId, const string& movieId, const vector<string>& data) const {
    // Parse data into a map of user to movies
    unordered_map<string, unordered_set<string>> userToMovies = parseData(data);

    // Identify relevant users (users who watched the given movieId)
    unordered_set<string> relevantUsers = getRelevantUsers(userToMovies, userId, movieId);

    // Calculate connection strength for each relevant user
    unordered_map<string, int> userConnections = getUserConnections(relevantUsers, userToMovies, userId, movieId);

    // Calculate movie connections for movies not yet watched by userId
    unordered_map<string, int> movieConnections = getMovieConnections(userConnections, userToMovies, userId, movieId);

    // Sort movies by connection strength and ID
    vector<string> sortedMovies = Utility::sortMoviesByConnection(movieConnections);

    // Return top 10 movies as a space-separated string
    stringstream result;
    for (size_t i = 0; i < std::min<size_t>(10, sortedMovies.size()); ++i) {
        if (i > 0) result << " ";
        result << sortedMovies[i];
    }

    return result.str();
}

// Executes the get command
string GetCommand::execute(const vector<string>& args) const {
    auto [isValid, validationMessage] = isInputValid(args);
    if (!isValid) {
        return validationMessage;
    }

    // Read data from the file
    string fileData = fileIO.read();

    // Generate recommendation using userId and movieId
    string recommendation = generateRecommendation(args[0], args[1], Utility::splitByLine(fileData));

    // Add "200 Ok\n\n" to the beginning of the output
    return "200 Ok\n\n" + recommendation;
}
