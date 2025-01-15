#include <gtest/gtest.h>
#include "../../src/commands/HelpCommand.h"
#include "../../src/managers/FileManager.h"

using namespace std;

class HelpCommandTest : public ::testing::Test {
protected:
    void SetUp() override {
        // Initialize things needed by each test
        fileManager = make_unique<FileManager>("_.txt");
        helpCommand = make_unique<HelpCommand>(*fileManager);
    }

    void TearDown() override {
        // Clean up resources after each test
    }

    unique_ptr<FileManager> fileManager;
    unique_ptr<HelpCommand> helpCommand;
};

TEST_F(HelpCommandTest, SanityTest)
{
    vector<string> vars = {};
    EXPECT_EQ(helpCommand->execute(vars), 
        "delete [userid] [movieid1] [movieid2] ...\n"
        "Get [userid] [movieid]\n"
        "patch [userid] [movieid1] [movieid2] ...\n"
        "post [userid] [movieid1] [movieid2] ...\n"
        "help"
        );
}

TEST_F(HelpCommandTest, InvalidInput)
{
    vector<string> vars = { "1", "2", "6" };
    EXPECT_EQ(helpCommand->execute(vars), "400 Bad Request");
}