#include "FileManager.h"
#include "CLIManager.h"

string CLIManager::read() {
    string input;
    //clears all prefix whitespaces
    cin >> ws;
    //or: getline(cin, input); x2 or: if (std::getline(cin >> ws, input)) //different approach
    getline(cin, input);

    return input;
}

void CLIManager::write(string input) {
    if (input.empty()) {
        return;
    }
    //prints the input to console
    cout << input << endl;
}