#include "Server.h"

Server::Server(const unsigned short int port) 
{
    if ((server_fd = socket(AF_INET, SOCK_STREAM, 0)) < 0)
    {
        // perror("Error creating server socket!");
    }
    address = (struct sockaddr_in*)malloc(sizeof(struct sockaddr_in));

    memset(address, 0, sizeof(*address));
    address->sin_family = AF_INET;
    address->sin_addr.s_addr = INADDR_ANY;
    address->sin_port = htons(port);

    threadPool = new ThreadPool(THREAD_POOL_SIZE);
}

Server::~Server() 
{
    for (SocketManager* sm : sockets)
    {
        sm->closeConnection();
    }
    requestQueue.clear();
    responseQueue.clear();

    close(server_fd);
}

string Server::read()
{
    // Continuously reads from request queue
    while (true)
    {
        usleep(TIME_DELAY);
        unique_lock<mutex> lock(requestMutex);
        if (!requestQueue.empty())
        {
            auto request = requestQueue.front();
            requestQueue.pop_front();
            currentProcessedThread = request.second;
            return request.first;
        }
    }
}

void Server::write(string input)
{
    // Write to response queue (for app)
    unique_lock<mutex> lock(responseMutex);
    pair<string, thread*> response = make_pair(input, currentProcessedThread);
    responseQueue.push_front(response);
}

void Server::write(string input, thread* writingThread)
{
    // Write to request queue (for threads within server)
    unique_lock<mutex> lock(requestMutex);
    pair<string, thread*> request = make_pair(input, writingThread);
    requestQueue.push_front(request);
}

void Server::acceptClients()
{
    while (true) 
    {
        try 
        {
            sockaddr_in clientAddr;
            unsigned int addr_len = sizeof(clientAddr);
            int client_fd = accept(server_fd, (sockaddr*)&clientAddr, &addr_len);
            if (client_fd < 0) 
            {
                // perror("Error accepting client connection");
                continue;
            }
            auto clientSocketManager = make_shared<SocketManager>(client_fd);
            // cout << "client has connected" << endl;

            sockets.emplace_back(clientSocketManager.get());
            threadPool->enqueue([this, clientSocketManager]() {
                handleClient(clientSocketManager.get());
            });
        }
        catch(const exception& ex) // Exception thrown by SocketManager
        {
            // Client disconnected, SocketManager handles closing connection
            // cerr << "Client exception: " << ex.what() << endl;
            continue;;
        }
    }
}

void Server::handleClient(SocketManager* clientSocketManagerPtr)
{
    auto threadID_itr = find_if((*threadPool).workers.begin(), (*threadPool).workers.end(),
                        [&](const thread& t) { return this_thread::get_id() == t.get_id(); });
    thread* threadID_ptr = &(*threadID_itr);

    // Communication with the client
    while (true) 
    {
        try 
        {
            // Get message from client, push to requests queue
            string clientMessage = clientSocketManagerPtr->readFromSocket();
            if (clientMessage.empty())
            {
                // client disconnected 
                break;
            }

            // cout << "client has sent: " << clientMessage << endl;
            write(clientMessage, threadID_ptr);

            // Get response, write back to client
            string response = findResponseForThread(threadID_ptr);
            clientSocketManagerPtr->write(response);
        }
        catch(const exception& ex) // Exception thrown by SocketManager
        {
            // Client disconnected, SocketManager handles closing connection
            // cerr << "Client disconnected: " << ex.what() << endl;
            break;
        }
    }
    // No need to delete socket manager pointer, it is a shared pointer
    clientSocketManagerPtr->closeConnection();
    cleanupQueues(threadID_ptr);
}

string Server::findResponseForThread(thread* threadID)
{
    while (true)
    {
        unique_lock<mutex> lock(responseMutex);
        auto it = find_if(responseQueue.begin(), responseQueue.end(),
                            [&](const auto& p) { return p.second->get_id() == threadID->get_id(); });
        if (it != responseQueue.end())
        {
            string response = it->first;
            responseQueue.erase(it);
            return response;
        }
        usleep(TIME_DELAY/10);
    }
}

void Server::cleanupQueues(thread* thread) 
{
    // If the thread has finished execution, we should delete garbage entries that contain this thread from the queues
    {
        // Clean up requestQueue
        unique_lock<mutex> lockRequest(requestMutex);
        requestQueue.erase(
            remove_if(requestQueue.begin(), requestQueue.end(),
                    [&](const auto& req) { return req.second->get_id() == thread->get_id(); }),
        requestQueue.end());
    }

    {
        // Clean up responseQueue
        unique_lock<mutex> lockResponse(responseMutex);
        responseQueue.erase(
            remove_if(responseQueue.begin(), responseQueue.end(),
                    [&](const auto& resp) { return resp.second->get_id() == thread->get_id(); }),
            responseQueue.end());
    }
}

void Server::runServer()
{
    if (bind(server_fd, (struct sockaddr *) address, sizeof(*address)) < 0)
    {
        // perror("Error binding"); 
    }
    if (listen(server_fd, BACKLOG) < 0)
    {
        // perror("Error listening");
    }

    // cout << "listening for clients..." << endl;

    // Disables sync with C-style I/O and unties cin and cout
    // Basically disables buffering for std::cout, I think this may solve a specific issue
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    threadPool->enqueue([this]() { acceptClients(); });
}
