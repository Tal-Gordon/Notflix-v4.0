#ifndef PATCHCOMMAND_H
#define PATCHCOMMAND_H

#include "ICommand.h"
#include "../utils/Utility.h"
#include <unordered_set>
#include <string>
#include <vector>

using std::string;
using std::vector;

class PatchCommand : public ICommand {
private:
    // Validates input arguments
    std::pair<bool, string> isInputValid(const vector<string>& args) const;

    // Helper function to process and update user data
    string updateUserData(const string& existingData, const vector<string>& args) const;

public:
    // Constructor
    explicit PatchCommand(DatabaseIO& ioManager) : ICommand(ioManager) {}

    // Executes the PatchCommand
    string execute(const vector<string>& args) const override;
};

#endif
