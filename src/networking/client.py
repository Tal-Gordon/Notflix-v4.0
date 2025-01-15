import socket
import sys

def main(server_host, server_port):
    ENCODING_TYPE = 'utf-8'
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        # Attempt to connect to the server
        client_socket.connect((server_host, server_port))
        print("Connected to server!")
    except ConnectionRefusedError:
        print("Unable to connect to the server. Please check if the server is running.")
        return

    try:
        # Communication loop
        while True:
            msg = input("Message to send: ")
            
            if msg.lower() == "quit" or msg.lower() == "exit":
                break

            client_socket.sendall(msg.encode(ENCODING_TYPE))
            
            server_response = client_socket.recv(4096).decode(ENCODING_TYPE)
            if not server_response:
                print("Server closed the connection.")
                break
            
            print("Server sent:\n", server_response)
    
    except (KeyboardInterrupt, socket.error) as e:
        pass
    
    finally:
        # Clean up and close the socket
        client_socket.close()
        print("Connection closed.")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python3 client.py <server_host_IP> <server_port>")
        sys.exit(1)
    main(sys.argv[1], int(sys.argv[2]))