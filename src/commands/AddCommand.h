#ifndef ADDCOMMAND_H
#define ADDCOMMAND_H

#include "ICommand.h"
#include "../utils/Utility.h"
#include <unordered_set>
#include <sstream>

using std::string;
using std::vector;

class AddCommand : public ICommand {
private:
    // Checks input validity
    bool isInputValid(const vector<string>& args) const;

    // Helper function to process and update user data
    string updateUserData(const string& existingData, const vector<string>& args) const;

public:
    // Constructor declaration (no definition here)
    explicit AddCommand(DatabaseIO& ioManager) : ICommand(ioManager) {}

    // Executes the AddCommand
    string execute(const vector<string>& args) const override;
};

#endif
