#ifndef SERVER_H
#define SERVER_H

#include <iostream>
#include <string>
#include <vector>
#include <thread>
#include <deque>
#include <algorithm>
#include <mutex>
#include "../managers/IOManager.h"
#include <netinet/in.h> // For sockaddr_in
#include <sys/socket.h> // For socket()
#include <unistd.h>     // For close()
#include <cstring>      // For memset()  #include "CLIManager.h"
#include "SocketManager.h"
class ThreadPool; // forward declaration, avoids circular dependency
#include "ThreadPool.h"

#define BACKLOG 10 // Maximum connection of 10 clients at once
#define TIME_DELAY 10000 // 0.01 second delay time to avoid busy waiting
#define THREAD_POOL_SIZE 10

using namespace std;

class Server : public IOManager 
{
private:
    vector<SocketManager*> sockets;
    ThreadPool* threadPool;
    deque<pair<string, thread*>> requestQueue;
    deque<pair<string, thread*>> responseQueue;
    mutex requestMutex;
    mutex responseMutex;
    thread* currentProcessedThread;
    int server_fd;
    struct sockaddr_in* address;

    void acceptClients();

    void handleClient(SocketManager* clientSocketPtr);

    string findResponseForThread(thread* threadID);

    void cleanupQueues(thread* thread);

public:
    Server(const unsigned short int port); // unsigned short int's range is 0-65535 - exactly the range of ports

    ~Server();

    string read();

    void write(string input);

    void write(string input, thread* writingThread);

    void runServer();
};

#endif