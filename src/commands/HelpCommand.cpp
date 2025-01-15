#include "HelpCommand.h"

using std::string;
using std::vector;

bool HelpCommand::isInputValid(const vector<string>& args) const {
    return args.empty(); // returns true if no arguments are passed and false o.w.
}

// Executes the HelpCommand
string HelpCommand::execute(const vector<string>& args) const {
    if (!isInputValid(args)) {
        return "400 Bad Request";
    }

    // Returns the help message
    return helpList;
}