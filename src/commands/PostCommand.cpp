#include "PostCommand.h"

using std::unordered_set;
using std::string;
using std::vector;

// Validates the input arguments
std::pair<bool, string> PostCommand::isInputValid(const vector<string>& args) const {
    // Ensure all arguments are numeric
    if (args.size() < 2) {
        return {false, "400 Bad Request"};
    }

    for (const auto& arg : args) {
        if (!Utility::isNumber(arg)) {
            return {false, "400 Bad Request"};
        }
    }

    // Check if the user already exists
    string userId = args[0];
    string existingData = fileIO.read();
    vector<string> lines = Utility::splitByLine(existingData);
    for (const auto& line : lines) {
        vector<string> tokens = Utility::splitByDelimiter(line, ' ');
        if (!tokens.empty() && tokens[0] == userId) {
            return {false, "404 Not Found"}; // User already exists
        }
    }

    return {true, "201 Created"};
}

// Adds a new user and their movies
string PostCommand::updateUserData(const string& existingData, const vector<string>& args) const {
    stringstream result;
    unordered_set<string> uniqueMovies; // To filter duplicates
    
    // Add the userId (first argument) to the result
    result << args[0];
    
    // Start iterating from the second argument to collect movie IDs
    for (size_t i = 1; i < args.size(); ++i) {
        if (uniqueMovies.insert(args[i]).second) { // Insert movieID and check if it's unique
            result << " " << args[i]; // Append only if it’s not a duplicate
        }
    }

    // Append a newline to end the line
    result << "\n";

    // Append the existing data, ensuring it is separated by a newline if needed
    if (!existingData.empty()) {
        result << existingData;
    }

    return result.str();
}



// Executes the PostCommand
string PostCommand::execute(const vector<string>& args) const {
    // Validate input
    auto [isValid, validationMessage] = isInputValid(args);
    if (!isValid) {
        return validationMessage;
    }

    // Read existing data
    string existingData = fileIO.read();

    // Add the new user
    string updatedData = updateUserData(existingData, args);

    // Write updated data back to the file
    fileIO.write(updatedData);

    // Reorder the file
    string reorderedData = Utility::reorderFile(fileIO.read());
    fileIO.write(reorderedData);

    return "201 Created";
}
