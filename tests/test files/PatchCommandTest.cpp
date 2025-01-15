#include <gtest/gtest.h>
#include "../../src/commands/PatchCommand.h"
#include "../../src/managers/FileManager.h"

using namespace std;

class PatchCommandTest : public ::testing::Test {
protected:
    void SetUp() override {
        // Initialize things needed by each test
        fileManager = make_unique<FileManager>("save.txt");
        patchCommand = make_unique<PatchCommand>(*fileManager);

        fileManager->write("1 100 200 300 400 500\n2 100 200 600 700");
    }

    void TearDown() override {
        // Clean up resources after each test
        remove("../data/save.txt");
        // delete fileManager;
        // delete patchCommand;
    }

    unique_ptr<FileManager> fileManager;
    unique_ptr<PatchCommand> patchCommand;
};

TEST_F(PatchCommandTest, SanityTest1)
{
    vector<string> args = { "1", "700", "600" };
    string answer = patchCommand->execute(args);

    EXPECT_EQ(fileManager->read(), "1 100 200 300 400 500 600 700\n2 100 200 600 700");
    EXPECT_EQ(answer, "204 No Content");
}

TEST_F(PatchCommandTest, SanityTest2)
{
    vector<string> args = { "1", "100", "200", "300", "800" };
    string answer = patchCommand->execute(args);

    EXPECT_EQ(fileManager->read(), "1 100 200 300 400 500 800\n2 100 200 600 700");
    EXPECT_EQ(answer, "204 No Content");
}

TEST_F(PatchCommandTest, Duplicates)
{
    vector<string> args = { "3", "100", "200" };
    string answer = patchCommand->execute(args);

    EXPECT_EQ(fileManager->read(), "1 100 200 300 400 500\n2 100 200 600 700");
    EXPECT_EQ(answer, "404 Not Found");
}

TEST_F(PatchCommandTest, InvalidInput1)
{
    vector<string> args = { "potato" };
    string answer = patchCommand->execute(args);
    EXPECT_EQ(answer, "400 Bad Request");
}

TEST_F(PatchCommandTest, InvalidInput2)
{
    vector<string> args = { "" };
    string answer = patchCommand->execute(args);
    EXPECT_EQ(answer, "400 Bad Request");
}

TEST_F(PatchCommandTest, InvalidInput3)
{
    vector<string> args = { "1" };
    string answer = patchCommand->execute(args);
    EXPECT_EQ(answer, "400 Bad Request");
}

TEST_F(PatchCommandTest, InvalidInput4)
{
    vector<string> args = { "1.0", "6" };
    string answer = patchCommand->execute(args);
    EXPECT_EQ(answer, "400 Bad Request");
}
