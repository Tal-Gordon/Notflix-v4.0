#include "IOManager.h"
#ifndef CLIMANAGER_H
#define CLIMANAGER_H

//class that read and print to console
class CLIManager : public IOManager {
public:
    string read();
    void write(string input);
};
#endif
