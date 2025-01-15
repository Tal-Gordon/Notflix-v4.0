#include "App.h"

using namespace std;

App::App(map<string, ICommand*> commands) : commands(commands) {}
// App::~App() {}
string App::run(IOManager* userio) // userio is communication with the user, like cli or sockets
{
    string string_input;
    while (true)
    {
        // Reads input, splits the command words into a vector
        string_input = userio->read();

        vector<string> command_parts;
        command_parts = Utility::splitByDelimiter(string_input, ' ');
        
        // Save and remove command word itself from vector
        // Vector now serves as args for commands
        string command = command_parts.front();
        command_parts.erase(command_parts.begin());
        string response = "400 Bad Request"; // default return

        // Searches the available commands for the command provided
        // If found, sends the rest of the input to the command in question
        if (commands.find(command) != commands.end()) 
        {
            response = commands[command]->execute(command_parts);
        }
        userio->write(response);
    }
}

map<string, ICommand*> App::initializeCommands() 
{
    map<string, ICommand*> commands;
    string fileName = "data.txt";
    FileManager* fileManager = new FileManager(fileName);

    commands["delete"] = new DeleteCommand(*fileManager);
    commands["help"] = new HelpCommand(*fileManager);
    commands["get"] = new GetCommand(*fileManager);
    commands["patch"] = new PatchCommand(*fileManager);
    commands["post"] = new PostCommand(*fileManager);

    return commands;
}
