#ifndef UTILITY_H
#define UTILITY_H

#include <string>
#include <vector>
#include <unordered_map>
#include <sstream>
#include <algorithm>
#include <cctype>
#include <map>

using std::string;
using std::vector;
using std::unordered_map;

class Utility {
public:
    // Returns true if the input is a number
    static bool isNumber(const string& str);

    // Splits a string by a given delimiter
    static vector<string> splitByDelimiter(const string& str, char delimiter);

    // Splits a string into lines
    static vector<string> splitByLine(const string& str);

    static vector<string> sortMoviesByConnection(const unordered_map<string, int>& movieConnections);

    // Orders the file from smallest IDs to biggest
    static string reorderFile(const string& fileData);

};

#endif