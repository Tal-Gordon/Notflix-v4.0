#include <gtest/gtest.h>
#include "../../src/commands/PostCommand.h"
#include "../../src/managers/FileManager.h"

using namespace std;

class PostCommandTest : public ::testing::Test {
protected:
    void SetUp() override {
        // Initialize things needed by each test
        fileManager = make_unique<FileManager>("save.txt");
        postCommand = make_unique<PostCommand>(*fileManager);

        vector<string> args = { "1", "2", "3", "4", "5" };
        postCommand->execute(args);
    }

    void TearDown() override {
        // Clean up resources after each test
        remove("../data/save.txt");
        // delete fileManager;
        // delete postCommand;
    }

    unique_ptr<FileManager> fileManager;
    unique_ptr<PostCommand> postCommand;
};

TEST_F(PostCommandTest, SanityTest1)
{
    EXPECT_EQ(fileManager->read(), "1 2 3 4 5");
}

TEST_F(PostCommandTest, SanityTest2)
{
    vector<string> args1 = { "2", "1", "2", "3", "4", "5" };
    string answer = postCommand->execute(args1);

    vector<string> args2 = { "2", "1", "2", "3", "4", "5" };
    vector<string> args3 = { "3", "1", "2", "3", "4", "5" };
    vector<string> args4 = { "4", "5", "2", "3", "2", "5" };

    EXPECT_EQ(fileManager->read(), "1 2 3 4 5\n2 1 2 3 4 5");
    EXPECT_EQ(answer, "201 Created");

    postCommand->execute(args2);
    postCommand->execute(args3);
    postCommand->execute(args4);

    EXPECT_EQ(fileManager->read(), "1 2 3 4 5\n2 1 2 3 4 5\n3 1 2 3 4 5\n4 2 3 5");
}

TEST_F(PostCommandTest, Duplicates)
{
    vector<string> args = { "1", "2", "6" };
    string answer = postCommand->execute(args);

    EXPECT_EQ(answer, "404 Not Found");
}

TEST_F(PostCommandTest, InvalidInput1)
{
    vector<string> args = { "potato" };
    string answer = postCommand->execute(args);
    EXPECT_EQ(answer, "400 Bad Request");
}

TEST_F(PostCommandTest, InvalidInput2)
{
    vector<string> args = { "" };
    string answer = postCommand->execute(args);
    EXPECT_EQ(answer, "400 Bad Request");
}

TEST_F(PostCommandTest, InvalidInput3)
{
    vector<string> args = { "1" };
    string answer = postCommand->execute(args);
    EXPECT_EQ(answer, "400 Bad Request");
}

TEST_F(PostCommandTest, InvalidInput4)
{
    vector<string> args = { "1.0", "6" };
    string answer = postCommand->execute(args);
    EXPECT_EQ(answer, "400 Bad Request");
}
