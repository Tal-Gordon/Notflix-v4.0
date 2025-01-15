#include "IOManager.h"
#include "FileManager.h"
#include <iostream>
#include <fstream>

//FileManager constructor
FileManager::FileManager(string name) : fileName("") {
    //if the filename is empty, exit, otherwise create the file or update it
    if (name.empty()) {
        exit;
    }
    filesystem::path current_path = filesystem::current_path();
    filesystem::path parent_path = current_path.parent_path();
    filesystem::path folder_path = parent_path / "data";

    // Ensure the 'data' subfolder exists, create it if necessary
    if (!filesystem::exists(folder_path)) {
        filesystem::create_directory(folder_path);
    }

    filesystem::path filePath = folder_path / name;
    fileName = filePath.string(); 
}

string FileManager::read() {
    ifstream file(fileName);
    //if the file doesnt open return ""
    if (!file) {
        return "";
    }
    string output, line;
    //newline is false at first and than true
    bool firstLine = true;
    //before a consecutive line that follows another, add a new line ('\n')
    while (getline(file, line)) {
        //if this is not the first line, add '\n' before the line
        if (!firstLine) {
            output += "\n";
        }
        firstLine = false;
        output += line;
    }
    file.close();
    return output;
}

void FileManager::write(string input) {
    //create or override the file with fileName with the new input
    ofstream file(fileName, ios::out);
    //if file doesn't open, return
    if (!file) {
        return;
    }
    file << input;
    file.close();
}