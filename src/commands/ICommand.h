#ifndef ICOMMAND_H
#define ICOMMAND_H

#include <string>
#include <vector>
#include "../managers/DatabaseIO.h"

using std::string;
using std::vector;

class ICommand {
protected:
    DatabaseIO& fileIO; // Reference to IOManager provided via constructor

public:
    // Constructor to initialize the IOManager reference
    explicit ICommand(DatabaseIO& ioManager) : fileIO(ioManager) {}

    // Pure virtual function to be implemented by derived classes
    virtual string execute(const vector<string>& args) const = 0;

    // Virtual destructor to ensure proper cleanup
    virtual ~ICommand() = default;
};

#endif