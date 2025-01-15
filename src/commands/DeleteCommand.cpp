#include "DeleteCommand.h"

using std::unordered_set;
using std::string;
using std::vector;

// Validates the input arguments
std::pair<bool, string> DeleteCommand::isInputValid(const vector<string>& args) const {
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
    bool userExists = false;
    unordered_set<string> userMovies;

    for (const auto& line : lines) {
        vector<string> tokens = Utility::splitByDelimiter(line, ' ');
        if (!tokens.empty() && tokens[0] == userId) {
            userExists = true;
            for (size_t i = 1; i < tokens.size(); ++i) {
                userMovies.insert(tokens[i]);
            }
            break;
        }
    }

    if (!userExists) {
        return {false, "404 Not Found"};
    }

    // Check if all specified movies exist for the user
    for (size_t i = 1; i < args.size(); ++i) {
        if (userMovies.find(args[i]) == userMovies.end()) {
            return {false, "404 Not Found"};
        }
    }

    return {true, "200 Ok"};
}

// Updates user data by removing specified movies
string DeleteCommand::updateUserData(const string& existingData, const vector<string>& args) const {
    string userId = args[0];
    unordered_set<string> moviesToDelete(args.begin() + 1, args.end());
    stringstream result;

    // Split existing data by line
    vector<string> lines = Utility::splitByLine(existingData);
    for (const string& line : lines) {
        vector<string> tokens = Utility::splitByDelimiter(line, ' ');

        if (!tokens.empty() && tokens[0] == userId) {
            // User found, remove specified movies
            result << userId;
            for (size_t i = 1; i < tokens.size(); ++i) {
                if (moviesToDelete.find(tokens[i]) == moviesToDelete.end()) {
                    result << " " << tokens[i]; // Keep movies not being deleted
                }
            }
            result << "\n";
        } else {
            // Keep existing line
            result << line << "\n";
        }
    }

    return result.str();
}

// Executes the DeleteCommand
string DeleteCommand::execute(const vector<string>& args) const {
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

    return "200 Ok";
}
