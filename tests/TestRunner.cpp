#include <gtest/gtest.h>

using namespace std;
using namespace testing;

class TestRunner 
{
public:
    TestRunner(int argc, char** argv) : argc_(argc), argv_(argv) { InitGoogleTest(&argc_, argv_); }

    void runAllTests() 
    {
        int _ = RUN_ALL_TESTS();
    }

    // Runs specific tests, based on google tests filter feature
    void runSpecificTests(const vector<string>& testNames) 
    {
        string filter = createTestFilter(testNames);
        GTEST_FLAG(filter) = filter;

        int _ = RUN_ALL_TESTS();
    }

private:
    int argc_;
    char** argv_;

    // Creates a gtest filter from the list of test names
    string createTestFilter(const std::vector<std::string>& testItems) {
    if (testItems.empty()) {
        return "*"; // Match all tests if no input is provided
    }

    std::vector<std::string> positivePatterns;

    // Process each item
    for (const auto& item : testItems) {
        if (item.find('.') != std::string::npos) {
            // Specific test case, e.g., SuiteName.TestName
            positivePatterns.push_back(item);
        } else {
            // Test suite, e.g., SuiteName.*
            positivePatterns.push_back(item + ".*");
        }
    }

    // Join all positive patterns with ':' separator
    std::ostringstream filterStream;
    for (size_t i = 0; i < positivePatterns.size(); ++i) {
        filterStream << positivePatterns[i];
        if (i < positivePatterns.size() - 1) {
            filterStream << ":";
        }
    }

    return filterStream.str();
}
};

int main(int argc, char** argv) 
{
    TestRunner testRunner(argc, argv);

    // Example: Change this to run specific tests or all tests
    bool runAll = true;

    if (runAll) 
    {
        testRunner.runAllTests();
    } 
    else 
    {
        // Can run a specific test suite, a specific test within a suite, and a combination of suites and tests
        // Examples: "ExampleTest.Test1", "ExampleSuite"
        vector<string> testsToRun = {
            "AppTest"
        };
        testRunner.runSpecificTests(testsToRun);
    }

    return 0;
}
