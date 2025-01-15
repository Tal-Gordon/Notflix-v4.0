# cmake_minimum_required(VERSION 3.14)
# project(Notflix)

# set(CMAKE_CXX_STANDARD 17)
# set(CMAKE_CXX_STANDARD_REQUIRED ON)

# if(CMAKE_SYSTEM_NAME STREQUAL "Linux")
#     set(CMAKE_C_COMPILER /usr/bin/cc)
#     set(CMAKE_CXX_COMPILER /usr/local/bin/c++)
# elseif(CMAKE_SYSTEM_NAME STREQUAL "Windows")
#     set(CMAKE_C_COMPILER C:/msys64/ucrt64/bin/gcc.exe)
#     set(CMAKE_CXX_COMPILER C:/msys64/ucrt64/bin/g++.exe)
# endif()

# file(GLOB_RECURSE SOURCES "src/*.cpp" "src/*.h")
# add_executable(main ${SOURCES})

# option(BUILD_TESTS "Build tests using Google Test" OFF)

# if (BUILD_TESTS)
#     enable_testing()
#     add_subdirectory(tests)
# endif()

# Minimum required CMake version
cmake_minimum_required(VERSION 3.14)

# Project name and settings
project(Notflix)

# Use C++17 standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Compiler configuration based on the operating system
if(CMAKE_SYSTEM_NAME STREQUAL "Linux")
    set(CMAKE_C_COMPILER gcc)
    set(CMAKE_CXX_COMPILER g++)
elseif(CMAKE_SYSTEM_NAME STREQUAL "Windows")
    set(CMAKE_C_COMPILER C:/msys64/ucrt64/bin/gcc.exe)
    set(CMAKE_CXX_COMPILER C:/msys64/ucrt64/bin/g++.exe)
endif()

# Collect source and header files recursively from the src directory
file(GLOB_RECURSE SOURCES "src/*.cpp" "src/*.h")

# Debugging: Print the list of source files
message(STATUS "Source files included in the build: ${SOURCES}")

# Specify the output directory for executables
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR})

# Create the main executable
add_executable(main ${SOURCES})

# Option to include tests
option(BUILD_TESTS "Build tests using Google Test" OFF)

if (BUILD_TESTS)
    # Enable testing and include the tests subdirectory
    enable_testing()
    add_subdirectory(tests)
endif()
