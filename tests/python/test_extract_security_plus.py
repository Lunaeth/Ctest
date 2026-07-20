import unittest

from scripts.extract_security_plus import parse_comments, parse_question_block


class ExtractSecurityPlusTests(unittest.TestCase):
    def test_community_vote_overrides_conflicting_official_answer(self):
        block = """Question #12 Topic 1
Which control best protects stored passwords?
A. Encryption
B. Salting Most Voted
C. Tokenization
D. Masking
Correct Answer:A
Community vote distribution
B (72%) A (28%)
Comments
studyUser Highly Voted1 year ago
Selected Answer: B
Salting adds random data before hashing and prevents identical passwords from sharing a hash.
"""

        question = parse_question_block(block)

        self.assertEqual(question["answer"], ["B"])
        self.assertEqual(question["officialAnswer"], ["A"])
        self.assertEqual(question["answerSource"], "community-vote")
        self.assertEqual(question["type"], "single")
        self.assertIn("Salting adds random data", question["discussion"]["summary"])
        self.assertIn("存在分歧", question["learning"]["speedTipHtml"])

    def test_multiselect_uses_highest_voted_answer_combination(self):
        block = """Question #20 Topic 1
Which TWO controls should be selected?
A. First control Most Voted
B. Second control
C. Third control Most Voted
D. Fourth control
Correct Answer:AD
Community vote distribution
AC (81%) AD (19%)
Comments
analyst Highly Voted2 months ago
Selected Answer: AC
The first and third controls satisfy the two separate requirements in the question.
"""

        question = parse_question_block(block)

        self.assertEqual(question["answer"], ["A", "C"])
        self.assertEqual(question["type"], "multiple")
        correct_options = [
            item["key"] for item in question["learning"]["options"] if item["isCorrect"]
        ]
        self.assertEqual(correct_options, ["A", "C"])

    def test_comment_parser_marks_highly_voted_and_selected_answer(self):
        comments = parse_comments(
            [
                "user123Highly Voted1 year, 2 months ago",
                "Selected Answer: C",
                "A detailed explanation that is long enough to support the selected answer.",
                "otherUser2 weeks ago",
                "Selected Answer: A",
                "A different explanation from another participant in the discussion.",
            ]
        )

        self.assertEqual(len(comments), 2)
        self.assertTrue(comments[0].highly_voted)
        self.assertEqual(comments[0].selected_answer, ["C"])
        self.assertFalse(comments[1].highly_voted)

    def test_known_image_only_option_is_restored(self):
        block = """Question #216 Topic 1
Which of the following examples would be best mitigated by input sanitization?
A.
Most Voted
B. nmap - 10.11.1.130
C. Email message: Click this link.
D. Browser message: Your connection is not private.
Correct Answer:A
Community vote distribution
A (100%)
Comments
analyst1 year ago
Selected Answer: A
Input sanitization blocks a cross-site scripting attempt from executing.
"""

        question = parse_question_block(block)

        self.assertEqual(question["options"][0]["text"], '<script>alert("Warning!");</script>')
        self.assertEqual(question["answer"], ["A"])


if __name__ == "__main__":
    unittest.main()
