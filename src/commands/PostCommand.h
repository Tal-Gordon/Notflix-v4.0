#ifndef POSTCOMMAND_H
#define POSTCOMMAND_H

#include "ICommand.h"
#include "../utils/Utility.h"
#include <unordered_set>
#include <sstream>

using std::string;
using std::vector;

class PostCommand : public ICommand {
private:
    // Checks input validity
    std::pair<bool, string> isInputValid(const vector<string>& args) const;

    // Helper function to process and update user data
    string updateUserData(const string& existingData, const vector<string>& args) const;

public:
    // Constructor
    explicit PostCommand(DatabaseIO& ioManager) : ICommand(ioManager) {}

    // Executes the PostCommand
    string execute(const vector<string>& args) const override;
};

#endif