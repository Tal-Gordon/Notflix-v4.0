#include "SocketManager.h"

SocketManager::SocketManager(int clientSocket) 
{
    SocketManager::clientSocket = clientSocket;
}

void SocketManager::closeConnection() 
{
    if (clientSocket >= 0) 
    {
        close(clientSocket);
        clientSocket = -1; // avoid double closing
    }
}

string SocketManager::readFromSocket() 
{
    string data = "";
    const int BUFFER_SIZE = 4096;
    vector<char> buffer(BUFFER_SIZE);
    // reading the message until null terminated
    while (true) 
    {
        ssize_t bytesRead = recv(clientSocket, buffer.data(), BUFFER_SIZE, 0);
        if (bytesRead < 0) 
        {  
            //failed
            closeConnection();
            throw std::runtime_error("connection lost (read failed)");
        }
        else if (bytesRead == 0)
        {
            // closed by user
            break;
        }
        data.append(buffer.data(), bytesRead);

        // if fewer bytes were read than we can handle, we assume the message has ended
        if (static_cast<size_t>(bytesRead) < BUFFER_SIZE) 
        {
            break;
        }
    }
    return data;
}

void SocketManager::write(string input) 
{
    size_t totalBytesSent = 0;
    size_t inputSize = input.size();

    while (totalBytesSent < inputSize) 
    {
        ssize_t bytesSent = send(clientSocket, input.c_str() + totalBytesSent, inputSize - totalBytesSent, 0);
        if (bytesSent < 0) 
        { 
            closeConnection();
            throw std::runtime_error("connection lost (write failed)");
        }
        totalBytesSent += bytesSent;
    }
}