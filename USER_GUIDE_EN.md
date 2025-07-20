# CodeCoach User Testing Guide

Welcome to CodeCoach! This is an interactive programming learning assistant designed to help users deepen their understanding of algorithmic problems and enhance their coding skills through Socratic dialogue.

This guide will walk you through testing the core features of CodeCoach.

---

## Table of Contents

- [CodeCoach User Testing Guide](#codecoach-user-testing-guide)
  - [Table of Contents](#table-of-contents)
    - [1. Starting a New Learning Session](#1-starting-a-new-learning-session)
    - [2. Interacting with the AI Tutor](#2-interacting-with-the-ai-tutor)
    - [3. Submitting Code and Getting Feedback](#3-submitting-code-and-getting-feedback)
    - [4. Using Learning Tools](#4-using-learning-tools)
    - [5. Completing a Mini-Challenge](#5-completing-a-mini-challenge)
    - [6. Suggested Testing Scenarios](#6-suggested-testing-scenarios)
      - [Scenario A: Fixing a Buggy Code](#scenario-a-fixing-a-buggy-code)
      - [Scenario B: From Brute-Force to Optimal Solution](#scenario-b-from-brute-force-to-optimal-solution)
      - [Scenario C: Mixing Learning Tools](#scenario-c-mixing-learning-tools)

---

### 1. Starting a New Learning Session

The application's core begins with a specific programming problem.

**Steps:**

1.  In the **"Start New Session"** form on the left, fill in the following information:

    - **Problem Description**: Paste the description of a programming problem.
    - **Language**: Select the language your code will be in (e.g., Python).
    - **Skill Level**: Choose a skill level (e.g., Beginner).

2.  **Suggested Test Case**:
    Please use the classic LeetCode problem **"Two Sums"** for the problem description:

    ```
    Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.
    ```

3.  After filling out the form, click the **"Start Session"** button.

---

### 2. Interacting with the AI Tutor

Once the session begins, the AI tutor will first analyze the problem and start the conversation.

**What you will see:**

- In the central chat window, the AI will provide an initial analysis of the problem and ask its first guiding question to stimulate your thinking.
- You can type your thoughts and answers in the input box at the bottom, just like a normal chat, and press Enter or click the send button.

---

### 3. Submitting Code and Getting Feedback

This is the core interactive feature of the application.

**Steps:**

1.  In the **code editor** on the right, you can type or paste your code solution.
2.  Once your code is ready, click the **"Get Feedback"** button below the editor.

**Please pay close attention to the feedback style:**

- **The AI will NOT give you the correct answer directly.** This is a core design principle.
- The AI uses a **Socratic method** for feedback. If your code has a logical error, it will ask a question to guide you to think about the flawed part of your logic.
- **Example**: If you submit a buggy "Two Sums" solution, the AI might not say, "Your loop range is wrong." Instead, it might ask, "That's a great attempt. Your loops are very close to working, but have you considered if they check every possible combination in the array?"

---

### 4. Using Learning Tools

During your problem-solving process, you can use the **"Learning Tools"** on the right panel at any time.

- **Request a Hint**: If you're stuck, click this button. The AI will provide a small hint that doesn't give away the solution.
- **Explain a Concept**: If you're unclear about a concept (e.g., "hash map"), you can type the term into the pop-up input box, and the AI will provide a concise explanation.
- **Generate a Challenge**: Click this button, and the AI will generate a small, relevant multiple-choice question based on the current problem to test your understanding of a core concept.

---

### 5. Completing a Mini-Challenge

When you request a challenge, a modal window will appear.

**Steps:**

1.  Read the challenge question and the four options (A/B/C/D).
2.  Click on the option card you believe is correct to select it.
3.  Click **"Submit Answer"**.
4.  The system will immediately tell you if your answer is correct and provide feedback.

---

### 6. Suggested Testing Scenarios

To comprehensively test the application's functionality, we recommend you follow these scenarios:

#### Scenario A: Fixing a Buggy Code

1.  **Start Session**: Use the "Two Sums" problem.
2.  **Submit Buggy Code**: Enter the following buggy brute-force solution into the code editor (it ignores the last element):
    ```python
    class Solution:
        def twoSum(self, nums: List[int], target: int) -> List[int]:
            n = len(nums) - 1
            for i in range(n):
                for j in range(i + 1, n):
                    if nums[i] + nums[j] == target:
                        return [i, j]
            return []
    ```
3.  **Get Feedback**: Click "Get Feedback" and experience the AI's guiding questions.
4.  **Interactive Fixing**: Try to fix your code step-by-step by interacting with the AI based on its questions until you arrive at a correct brute-force solution.

#### Scenario B: From Brute-Force to Optimal Solution

1.  **Submit Correct Code**: Building on Scenario A, submit a fully correct brute-force solution.
2.  **Observe Feedback**: The AI should first acknowledge your correct answer and then ask a question to guide you toward performance optimization, such as: "This solution is excellent! It works perfectly. Now, can you think of a way to find the answer with only one pass through the array?"
3.  **Use Tools**: Use the **"Explain a Concept"** tool and enter `hash map` or `dictionary` to learn about it.
4.  **Attempt Optimal Solution**: Based on your new knowledge, try to write the O(n) solution using a hash map in the editor and get feedback again.

#### Scenario C: Mixing Learning Tools

At any stage of problem-solving:

- When you feel lost, click **"Request a Hint"**.
- When you want to solidify a concept, click **"Generate a Challenge"**.

---

Thank you for your testing! Your feedback is crucial for improving CodeCoach.
