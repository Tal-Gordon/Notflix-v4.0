#include "PatchCommand.h"

using std::unordered_set;
using std::string;
using std::vector;

// Validates the input arguments
std::pair<bool, string> PatchCommand::isInputValid(const vector<string>& args) const {
    // Ensure all arguments are numeric
    if (args.size() < 2) {
        return {false, "400 Bad Request"};
    }
    for (const auto& arg : args) {
        if (!Utility::isNumber(arg)) {
            return {false, "400 Bad Request"};
        }
    }

    // Check if the user exists
    string userId = args[0];
    string fileData = fileIO.read();
    vector<string> lines = Utility::splitByLine(fileData);
    for (const auto& line : lines) {
        vector<string> tokens = Utility::splitByDelimiter(line, ' ');
        if (!tokens.empty() && tokens[0] == userId) {
            return {true, "204 No Content"};
        }
    }

    return {false, "404 Not Found"};
}

// Updates user data
string PatchCommand::updateUserData(const string& existingData, const vector<string>& args) const {
    unordered_set<string> userMovies;  // To keep track of movie IDs
    string userId = args[0];
    stringstream result;

    // Remove duplicates in args by inserting them into a set
    unordered_set<string> inputMovies(args.begin() + 1, args.end());

    // Split existing data by line
    vector<string> lines = Utility::splitByLine(existingData);
    for (const string& line : lines) {
        vector<string> tokens = Utility::splitByDelimiter(line, ' ');

        if (!tokens.empty() && tokens[0] == userId) {
            // User found; add existing movies to the set
            for (size_t i = 1; i < tokens.size(); ++i) {
                userMovies.insert(tokens[i]);
            }

            // Add unique movies from input
            userMovies.insert(inputMovies.begin(), inputMovies.end());

            // Construct the updated line
            result << userId;
            for (const auto& movie : userMovies) {
                result << " " << movie;
            }
            result << "\n";
        } else {
            // Keep existing line
            result << line << "\n";
        }
    }

    return result.str();
}

// Executes the PatchCommand
string PatchCommand::execute(const vector<string>& args) const {
    // Validate input
    auto [isValid, validationMessage] = isInputValid(args);
    if (!isValid) {
        return validationMessage;
    }

    // Read existing data
    string existingData = fileIO.read();

    // Update user data
    string updatedData = updateUserData(existingData, args);

    // Write updated data back to the file
    fileIO.write(updatedData);

    // Reorder the file
    string reorderedData = Utility::reorderFile(fileIO.read());
    fileIO.write(reorderedData);

    return "204 No Content";
}
