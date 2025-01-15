#ifndef SOCKETMANAGER_H
#define SOCKETMANAGER_H
#include <string>
#include <stdio.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <stdexcept>
#include <codecvt>
#include <vector>
using namespace std;

//class that read and print to a socket
class SocketManager {
private:
    int clientSocket;
public:
    SocketManager(int clientSocket);
    void closeConnection();
    string readFromSocket();
    void write(string input);
};
#endif