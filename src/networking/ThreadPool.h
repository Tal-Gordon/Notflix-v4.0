#ifndef THREADPOOL_H
#define THREADPOOL_H

#include <queue>
#include <condition_variable>
#include <functional>
#include <mutex>
#include <thread>
#include "Server.h"

using namespace std;

class ThreadPool 
{
    friend class Server;
private:
    vector<thread> workers;
    queue<function<void()>> tasks;
    mutex threadPoolMutex;
    condition_variable condition;
    bool stop = false;

public:
    ThreadPool(int numThreads);

    ~ThreadPool();

    void enqueue(function<void()> task);
};

#endif