#include <gtest/gtest.h>
#include "../../src/managers/CLIManager.h"

class CLIManagerTest : public ::testing::Test {
protected:
    CLIManager cliManager;
    std::ostringstream outputCapture;
    std::istringstream inputCapture;

    void SetUp() override {
        // Initialize things needed by each test
        CLIManager CLIManager;
        std::cout.rdbuf(outputCapture.rdbuf());
    }

    void TearDown() override {
        // Restore original cout
        std::cout.rdbuf(std::cout.rdbuf());
    }

    void setInput(const std::string& input) {
        inputCapture.str(input);  // Set input string
        inputCapture.clear();  // Clear any previous states
        std::cin.rdbuf(inputCapture.rdbuf());  // Redirect cin to inputCapture
    }
};

TEST_F(CLIManagerTest, ReadInput) {
    // Simulate input
    setInput("Hello, World!");

    // Call the read function
    std::string result = cliManager.read();

    // Verify the result
    ASSERT_EQ(result, "Hello, World!");
}

TEST_F(CLIManagerTest, ReadInput1) {
    // Simulate input
    setInput("");

    // Call the read function
    std::string result = cliManager.read();

    // Verify the result
    ASSERT_EQ(result, "");
}

TEST_F(CLIManagerTest, ReadInput2) {
    // Simulate input
    setInput("\n");

    // Call the read function
    std::string result = cliManager.read();

    // Verify the result
    ASSERT_EQ(result, "");
}

TEST_F(CLIManagerTest, WriteOutput1) {
    std::string input = "This is a test!";
    
    // Call the write function
    cliManager.write(input);

    // Capture the output and verify
    ASSERT_EQ(outputCapture.str(), input + "\n");  // Including newline character printed by std::endl
}


TEST_F(CLIManagerTest, WriteOutput2) {
    std::string input = "";
    
    // Call the write function
    cliManager.write(input);

    // Capture the output and verify
    ASSERT_EQ(outputCapture.str(), input);  // Including newline character printed by std::endl
}

TEST_F(CLIManagerTest, WriteOutput3) {
    std::string input = "\n";
    
    // Call the write function
    cliManager.write(input);

    // Capture the output and verify
    ASSERT_EQ(outputCapture.str(), input + "\n");  // Including newline character printed by std::endl
}