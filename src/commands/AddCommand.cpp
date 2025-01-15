#include "AddCommand.h"

using std::unordered_set;
using std::string;
using std::vector;

bool AddCommand::isInputValid(const vector<string>& args) const {
    // Ensure all arguments are numeric
    for (const auto& arg : args) {
        if (!Utility::isNumber(arg)) {
            return false;
        }
    }

    if (args.size() < 2) {
        return false;
    }
    
    return true;
}

// Updates or appends user data
string AddCommand::updateUserData(const string& existingData, const vector<string>& args) const {
    unordered_set<string> userMovies;  // To keep track of movie IDs
    string userId = args[0];
    stringstream result;

    bool userFound = false;

    // Remove duplicates in args by inserting them into a set
    unordered_set<string> inputMovies(args.begin() + 1, args.end());

    // Split existing data by line
    vector<string> lines = Utility::splitByLine(existingData);
    for (const string& line : lines) {
        vector<string> tokens = Utility::splitByDelimiter(line, ' ');

        if (!tokens.empty() && tokens[0] == userId) {
            // User found; add existing movies to the set
            userFound = true;

            // Add existing movies to the set
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

    // If the user was not found, add a new line
    if (!userFound) {
        result << userId;
        for (const auto& movie : inputMovies) {
            result << " " << movie;
        }
        result << "\n";
    }

    return result.str();
}

// Executes the AddCommand
string AddCommand::execute(const vector<string>& args) const {
    if (!isInputValid(args)) {
        return "";
    }
    // Read existing data
    string existingData = fileIO.read();

    // Update or append user data
    string updatedData = updateUserData(existingData, args);

    // Write updated data back to the file
    fileIO.write(updatedData);

    // Reorder the file
    string reorderedData = Utility::reorderFile(fileIO.read());
    fileIO.write(reorderedData);

    return "";
}