#ifndef APP_H
#define APP_H

#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <thread>

#include "../managers/CLIManager.h"
#include "../managers/FileManager.h"
#include "../networking/Server.h"
#include "../commands/DeleteCommand.h"
#include "../commands/HelpCommand.h"
#include "../commands/GetCommand.h"
#include "../commands/PatchCommand.h"
#include "../commands/PostCommand.h"
#include "../utils/Utility.h"

class App {
private:
    std::map<std::string, ICommand*> commands;
public:
    App(std::map<std::string, ICommand*> commands);
    // ~App();

    static std::map<std::string, ICommand*> initializeCommands();

    std::string run(IOManager* iomanager);
};

#endif
