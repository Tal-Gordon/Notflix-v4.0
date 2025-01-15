#include <gtest/gtest.h>
#include "../../src/managers/FileManager.h"

class FileManagerTest : public ::testing::Test {
protected:
    FileManager* f1;
    FileManager* fEmpty;
    std::string fileName = "testfile.txt";
    std::string str1 = "  hello  world";
    std::string emptyStr = "";

    void SetUp() override {
        str1 = "Hello, World!";
        f1 = new FileManager(fileName);
        fEmpty = new FileManager(emptyStr);
    }

    void TearDown() override {
        if (std::filesystem::exists(fileName)) {
            std::remove(fileName.c_str());
        }
        delete f1;
        delete fEmpty;
    }
};

TEST_F(FileManagerTest, WriteToFile) {
    f1->write(str1);
    std::ifstream file(fileName);
    std::string fileContent = f1->read();
    file.close();
    ASSERT_EQ(fileContent, str1);
}

TEST_F(FileManagerTest, WriteToFileWithNoName) {
    fEmpty->write(str1);
    std::string fileContent = fEmpty->read();
    ASSERT_EQ(fileContent, emptyStr);
}

TEST_F(FileManagerTest, WriteEmptyInput) {
    f1->write(emptyStr);
    std::ifstream file(fileName);
    //ASSERT_TRUE(file.is_open());
    std::string fileContent;
    std::getline(file, fileContent);
    file.close();
    ASSERT_EQ(fileContent, emptyStr);
}

TEST_F(FileManagerTest, ReadFromFile) {
    f1->write(str1);
    std::string fileContent = f1->read();
    ASSERT_EQ(fileContent, str1);
}

TEST_F(FileManagerTest, ReadEmptyFile) {
    f1->write(emptyStr);
    std::string fileContent = f1->read();
    ASSERT_EQ(fileContent, emptyStr);
}

TEST_F(FileManagerTest, ReadNonexistentFile) {
    std::string fileContent = fEmpty->read();
    ASSERT_EQ(fileContent, emptyStr);
}

TEST_F(FileManagerTest, OverrideTest1)
{
    f1->write("aas");

    f1->write("hello world");
    std::string fileContent = f1->read();
    ASSERT_EQ(fileContent, "hello world");
}

TEST_F(FileManagerTest, OverrideTest2)
{
    f1->write("aas");
    f1->write("");
    std::string fileContent = f1->read();
    ASSERT_EQ(fileContent, "");
}

TEST_F(FileManagerTest, ReadNewLine)
{
    f1->write("\n");
    std::string fileContent = f1->read();
    ASSERT_EQ(fileContent, "");
}

TEST_F(FileManagerTest, FolderDoesntExist)
{
    if (std::filesystem::exists("../data/testfile.txt")) {
        std::filesystem::remove("../data/testfile.txt");
    }
    f1->write("a");
    std::string fileContent = f1->read();
    ASSERT_EQ(fileContent, "a");
    }