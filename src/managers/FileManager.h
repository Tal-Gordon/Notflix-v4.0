#ifndef FILEMANAGER_H
#define FILEMANAGER_H

#include "DatabaseIO.h"
#include <filesystem>

//class that read and print to a file
class FileManager : public DatabaseIO {
private:
    string fileName;
public:
    FileManager(string name);
    string read();
    void write(string input);
};

#endif