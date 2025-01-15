#ifndef HELPCOMMAND_H
#define HELPCOMMAND_H

#include "ICommand.h"

using std::string;
using std::vector;

class HelpCommand : public ICommand {
private:
    // List of all commands
    string helpList = 
        "delete [userid] [movieid1] [movieid2] ...\n"
        "Get [userid] [movieid]\n"
        "patch [userid] [movieid1] [movieid2] ...\n"
        "post [userid] [movieid1] [movieid2] ...\n"
        "help";
    
    // Checks input validity
    bool isInputValid(const vector<string>& args) const;

public:
    // Constructor to initialize HelpCommand with IOManager
    explicit HelpCommand(DatabaseIO& ioManager) : ICommand(ioManager) {}

    // Implements the ICommand interface
    string execute(const vector<string>& args) const override;
};

#endif