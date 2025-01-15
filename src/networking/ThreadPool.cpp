#include "ThreadPool.h"

ThreadPool::ThreadPool(int numThreads) 
{
    for (int i = 0; i < numThreads; ++i) 
    {
        workers.emplace_back([this]() 
        {
            while (true) 
            {
                function<void()> task;

                {
                    unique_lock<mutex> lock(threadPoolMutex);
                    condition.wait(lock, [this]() { return stop || !tasks.empty(); });

                    if (stop && tasks.empty())
                        return;

                    task = move(tasks.front());
                    tasks.pop();
                }

                task();
            }
        });
    }
}

ThreadPool::~ThreadPool() 
{
    {
        unique_lock<mutex> lock(threadPoolMutex);
        stop = true;
    }
    condition.notify_all();
    for (thread &worker : workers) 
    {
        worker.join();
    }
}

void ThreadPool::enqueue(function<void()> task) 
{
    {
        unique_lock<mutex> lock(threadPoolMutex);
        tasks.push(move(task));
    }
    condition.notify_one();
}