#include "../../src/utils/Utility.h"
#include <gtest/gtest.h>
#include <unordered_map>
#include <vector>
#include <string>

// Test for Utility::isNumber
TEST(UtilityTest, IsNumberTest) {
    EXPECT_TRUE(Utility::isNumber("12345"));
    EXPECT_TRUE(Utility::isNumber("0"));
    EXPECT_FALSE(Utility::isNumber("12a45"));
    EXPECT_FALSE(Utility::isNumber("12.45"));
    EXPECT_FALSE(Utility::isNumber(""));
    EXPECT_FALSE(Utility::isNumber("-12345"));
}

// Test for Utility::splitByDelimiter
TEST(UtilityTest, SplitByDelimiterTest) {
    EXPECT_EQ(Utility::splitByDelimiter("1 2 3 4 5", ' '), vector<string>({"1", "2", "3", "4", "5"}));
    EXPECT_EQ(Utility::splitByDelimiter("1,2,3,4,5", ','), vector<string>({"1", "2", "3", "4", "5"}));
    EXPECT_EQ(Utility::splitByDelimiter("", ','), vector<string>({}));
    // EXPECT_EQ(Utility::splitByDelimiter("1,,3", ','), vector<string>({"1", "", "3"}));
}

// Test for Utility::splitByLine
TEST(UtilityTest, SplitByLineTest) {
    EXPECT_EQ(Utility::splitByLine("Line1\nLine2\nLine3"), vector<string>({"Line1", "Line2", "Line3"}));
    EXPECT_EQ(Utility::splitByLine("Line1 \nLine2 \nLine3 "), vector<string>({"Line1 ", "Line2 ", "Line3 "}));
    EXPECT_EQ(Utility::splitByLine("SingleLine"), vector<string>({"SingleLine"}));
    EXPECT_EQ(Utility::splitByLine(""), vector<string>({})); // Empty input
    EXPECT_EQ(Utility::splitByLine("Line1\n\nLine3"), vector<string>({"Line1", "", "Line3"})); // Consecutive newlines
}

// Test for Utility::sortMoviesByConnection
TEST(UtilityTest, SortMoviesByConnectionTest) {
    unordered_map<string, int> movieConnections = {{"3", 10}, {"2", 5}, {"1", 10}, {"4", 2}};
    vector<string> expected = {"1", "3", "2", "4"};
    EXPECT_EQ(Utility::sortMoviesByConnection(movieConnections), expected);
}

// Test for Utility::reorderFile
TEST(UtilityTest, ReorderFileTest) {
    string input = "2 101 102\n1 103\n3 104 105";
    string expected = "1 103\n2 101 102\n3 104 105\n"; // Sorted by user ID
    EXPECT_EQ(Utility::reorderFile(input), expected);

    input = "2 105 101 103\n1 104\n";
    expected = "1 104\n2 101 103 105\n"; // Sorted by user ID and user movies
    EXPECT_EQ(Utility::reorderFile(input), expected);

    EXPECT_EQ(Utility::reorderFile(""), ""); // Empty input
}