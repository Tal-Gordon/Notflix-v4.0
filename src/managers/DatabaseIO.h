#ifndef DATABASEIO_H
#define DATABASEIO_H

#include <iostream>
#include <fstream>
#include <string>

using namespace std;

class DatabaseIO {
public:
    //reads input and return it as string
    virtual string read() = 0;  // Pure virtual function
    //write the input string to the console\file..
    virtual void write(string input) = 0;  // Pure virtual function
};

#endif