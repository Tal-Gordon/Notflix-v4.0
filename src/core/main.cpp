#include "App.h"

int main(int argc, char const *argv[])
{
    App app(App::initializeCommands());
    // CLIManager cli;
    Server server(12345);
    thread appThread([&]() { server.runServer(); });
    app.run(&(server));
    return 0;
}