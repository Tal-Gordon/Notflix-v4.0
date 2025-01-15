#include "gtest/gtest.h"
#include "../../src/commands/GetCommand.h"
#include "../../src/managers/FileManager.h"
#include <vector>
#include <string>
#include <filesystem>

using std::string;
using std::vector;
namespace fs = std::filesystem;

// Test the GetCommand with a real FileManager
class GetCommandTest : public ::testing::Test {
protected:
    // FileManager instance with a hardcoded file name for testing
    FileManager fileManager{"test_data.txt"}; // Specify a test file name

    // GetCommand instance
    GetCommand getCommand{fileManager};

    // Constructor to initialize GetCommand with FileManager
    GetCommandTest() {}

    void SetUp() override {
        // Sample data for the test
        string testData = 
            "1 100 200\n"
            "2 100 300\n"
            "3 200 300\n"
            "4 300 400\n"
            "5 200 100 300\n"
            "6 100 400 200\n";
        fileManager.write(testData);
    }

    void TearDown() override {
        // Clean up the test file after each test
        fs::remove("test_data.txt");
    }
};

// Test Case 1: Simple Recommendation Test
TEST_F(GetCommandTest, SimpleRecommendationTest) {
    vector<string> args = {"1", "100"};
    string recommendation = getCommand.execute(args);

    string expectedRecommendation = "200 Ok\n\n300 400";
    EXPECT_EQ(recommendation, expectedRecommendation);
}

// Test Case 2: No Common Movies
TEST_F(GetCommandTest, NoCommonMovies) {
    vector<string> args = {"1", "2"};
    string recommendation = getCommand.execute(args);

    string expectedRecommendation = "404 Not Found";
    EXPECT_EQ(recommendation, expectedRecommendation);
}

// Test Case 4: All Users Watch Same Movie
TEST_F(GetCommandTest, AllUsersWatchSameMovie) {
    string testData = 
        "1 100 200\n"
        "2 100 200\n"
        "3 100 200\n"
        "4 100 200\n";
    fileManager.write(testData);

    vector<string> args = {"2", "100"};
    string recommendation = getCommand.execute(args);

    string expectedRecommendation = "200 Ok\n\n";
    EXPECT_EQ(recommendation, expectedRecommendation);
}

// Test Case 5: Larger Dataset
TEST_F(GetCommandTest, largerDataset) {
    // Recreate the dataset
    string testData = 
        "1 100 200\n"
        "2 100 300\n"
        "3 100 400\n"
        "4 200 300 400\n"
        "5 200 300 400 500\n"
        "6 100 200 300 500\n"
        "7 200 400 500\n"
        "8 300 400\n"
        "9 100 200 300 400 500\n"
        "10 200 400 500\n"
        "11 100 200 300\n"
        "12 100 600";
    fileManager.write(testData);
    // 300 =  3, 400 = 4, 500 = 5
    vector<string> args = {"1", "100"};
    string recommendation = getCommand.execute(args);

    string expectedRecommendation = "200 Ok\n\n300 500 400 600";
    EXPECT_EQ(recommendation, expectedRecommendation);
}

// Test Case 6: More Than 10 Movies
TEST_F(GetCommandTest, moreThan10Movies) {
    // Recreate the dataset
    string testData = 
        "1 100 200\n"
        "2 100 300\n"
        "3 100 400\n"
        "4 200 300 400\n"
        "5 200 300 400 500\n"
        "6 100 200 300 500\n"
        "7 200 400 500\n"
        "8 300 400\n"
        "9 100 200 300 400 500\n"
        "10 200 400 500\n"
        "11 100 200 300 600 700 800 900 1000 1100 1200 1300\n";
    fileManager.write(testData);

    vector<string> args = {"1", "100"};
    string recommendation = getCommand.execute(args);

    string expectedRecommendation = "200 Ok\n\n300 500 400 600 700 800 900 1000 1100 1200";
    EXPECT_EQ(recommendation, expectedRecommendation);
}

// Test Case 7: Invalid Inputs
TEST_F(GetCommandTest, InvalidInputs) {
    vector<string> args1 = {"1", "10.0"};
    string recommendation1 = getCommand.execute(args1);
    
    vector<string> args2 = {};
    string recommendation2 = getCommand.execute(args2);
    
    vector<string> args3 = {"1"};
    string recommendation3 = getCommand.execute(args3);
    
    vector<string> args4 = {"1", "100", "200"};
    string recommendation4 = getCommand.execute(args4);

    vector<string> args5 = {"1", "150"};
    string recommendation5 = getCommand.execute(args5);

    vector<string> args6 = {"15", "100"};
    string recommendation6 = getCommand.execute(args6);
    
    EXPECT_EQ(recommendation1, "400 Bad Request");
    EXPECT_EQ(recommendation2, "400 Bad Request");
    EXPECT_EQ(recommendation3, "400 Bad Request");
    EXPECT_EQ(recommendation4, "400 Bad Request");
    EXPECT_EQ(recommendation5, "404 Not Found");
    EXPECT_EQ(recommendation6, "404 Not Found");
}

// Test Case 8: Empty Dataset
TEST_F(GetCommandTest, emptyDataset) {
    // Recreate the dataset
    string testData = "";
    fileManager.write(testData);
        
    vector<string> args = {"1", "100"};
    string recommendation = getCommand.execute(args);

    string expectedRecommendation = "404 Not Found";
    EXPECT_EQ(recommendation, expectedRecommendation);
}