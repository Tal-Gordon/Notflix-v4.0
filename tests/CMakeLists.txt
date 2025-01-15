include(FetchContent)
FetchContent_Declare(
    googletest
    URL https://github.com/google/googletest/archive/refs/tags/release-1.12.1.tar.gz
)
# For Windows: Prevent overriding the parent project's compiler/linker settings
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

file(GLOB_RECURSE TEST_SOURCES "*.cpp")
list(REMOVE_ITEM SOURCES "${CMAKE_SOURCE_DIR}/src/core/main.cpp")
add_executable(TestRunner ${TEST_SOURCES} ${SOURCES})
target_link_libraries(TestRunner gtest gtest_main)

include(GoogleTest)
gtest_discover_tests(TestRunner)
