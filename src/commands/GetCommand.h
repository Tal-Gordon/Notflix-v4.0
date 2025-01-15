#ifndef GETCOMMAND_H
#define GETCOMMAND_H

#include "ICommand.h"
#include "../utils/Utility.h"
#include <unordered_set>
#include <algorithm>
#include <sstream>

using std::string;
using std::vector;

class GetCommand : public ICommand {
private:
    // Validates the input arguments
    std::pair<bool, string> isInputValid(const vector<string>& args) const;

    // Parse data into a map of user to movies
    unordered_map<string, unordered_set<string>> parseData(const vector<string>& data) const;

    // Identify relevant users (users who watched the given movieId)
    unordered_set<string> getRelevantUsers(const unordered_map<string, unordered_set<string>>& userToMovies, const string& userId, const string& movieId) const;

    // Calculate connection strength for each relevant user
    unordered_map<string, int> getUserConnections(const unordered_set<string>& relevantUsers, const unordered_map<string, unordered_set<string>>& userToMovies, const string& userId, const string& movieId) const;

    // Calculate movie connections for movies not yet watched by userId
    unordered_map<string, int> getMovieConnections(const unordered_map<string, int>& userConnections, const unordered_map<string, unordered_set<string>>& userToMovies, const string& userId, const string& movieId) const;

    // Generate the recommendation
    string generateRecommendation(const string& userId, const string& movieId, const vector<string>& data) const;

public:
    // Constructor
    explicit GetCommand(DatabaseIO& ioManager) : ICommand(ioManager) {}

    // Implements the execute method from ICommand
    string execute(const vector<string>& args) const override;
};

#endif