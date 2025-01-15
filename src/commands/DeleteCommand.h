#ifndef DELETECOMMAND_H
#define DELETECOMMAND_H

#include "ICommand.h"
#include "../utils/Utility.h"
#include <unordered_set>
#include <sstream>
#include <string>
#include <vector>

using std::string;
using std::vector;

class DeleteCommand : public ICommand {
private:
    // Validates input arguments
    std::pair<bool, string> isInputValid(const vector<string>& args) const;

    // Updates user data by removing specified movies
    string updateUserData(const string& existingData, const vector<string>& args) const;

public:
    // Constructor
    explicit DeleteCommand(DatabaseIO& ioManager) : ICommand(ioManager) {}

    // Executes the DeleteCommand
    string execute(const vector<string>& args) const override;
};

#endif
