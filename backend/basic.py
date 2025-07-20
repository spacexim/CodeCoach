from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain  # 暂时保留以避免大规模重构
from langchain.memory import ConversationBufferMemory
from langchain.output_parsers import StructuredOutputParser, ResponseSchema
from langchain_community.chat_models import ChatOpenAI
from typing import Dict, List, Optional, Any, Mapping, Callable
import warnings
import requests
import os
from langchain_community.llms import OpenAI
import json
import time
import asyncio
import inspect

# 临时抑制LangChain弃用警告，等待完整迁移
warnings.filterwarnings("ignore", category=DeprecationWarning, module="langchain")

# 使用LangChain的自定义LLM类
from langchain.llms.base import LLM
from langchain.callbacks.manager import CallbackManagerForLLMRun


class OpenRouterLLM(LLM):
    model: str = "anthropic/claude-3-opus"
    temperature: float = 0.2
    api_key: str
    streaming_callback: Optional[Callable[[str], None]] = None

    @property
    def _llm_type(self) -> str:
        return "openrouter"

    def _call(
            self,
            prompt: str,
            stop: Optional[List[str]] = None,
            run_manager: Optional[CallbackManagerForLLMRun] = None,
            **kwargs: Any,
    ) -> str:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "http://localhost:8000", # 后端地址
            "X-Title": "Programming Learning Assistant"
        }

        # 决定 data 中的 stream 参数
        is_streaming = self.streaming_callback is not None
        data = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": self.temperature,
            "stream": is_streaming
        }

        if stop:
            data["stop"] = stop

        if is_streaming:
            # --- 流式输出模式 ---
            full_response = ""
            try:
                with requests.post(
                        "https://openrouter.ai/api/v1/chat/completions",
                        headers=headers,
                        json=data,
                        stream=True,
                        timeout=30,  # 添加超时
                        verify=True  # 确保SSL验证
                ) as response:
                    if response.status_code != 200:
                        raise ValueError(f"Error: {response.status_code}, {response.text}")

                    for line in response.iter_lines():
                        if line:
                            line_text = line.decode('utf-8')
                            if line_text.startswith("data: "):
                                line_text = line_text[6:]
                            if line_text.strip() == "[DONE]":
                                continue
                            try:
                                chunk = json.loads(line_text)
                                if "choices" in chunk and len(chunk["choices"]) > 0:
                                    if "delta" in chunk["choices"][0] and "content" in chunk["choices"][0]["delta"]:
                                        content = chunk["choices"][0]["delta"]["content"]
                                        full_response += content
                                        if self.streaming_callback:
                                            # 检查回调是否是异步函数
                                            if inspect.iscoroutinefunction(self.streaming_callback):
                                                # 如果是异步函数，需要在事件循环中运行
                                                try:
                                                    loop = asyncio.get_event_loop()
                                                    if loop.is_running():
                                                        # 如果事件循环正在运行，等待任务完成
                                                        task = asyncio.create_task(self.streaming_callback(content))
                                                        # 这里我们需要等待任务完成，但不能在这里直接await
                                                        # 所以我们暂时保持原来的行为，但添加异常处理
                                                        pass
                                                    else:
                                                        # 如果没有运行的事件循环，直接运行
                                                        asyncio.run(self.streaming_callback(content))
                                                except Exception as e:
                                                    print(f"Error in async streaming callback: {e}")
                                            else:
                                                # 如果是普通函数，直接调用
                                                self.streaming_callback(content)
                            except json.JSONDecodeError:
                                pass
            except (requests.exceptions.SSLError, requests.exceptions.ConnectionError, requests.exceptions.Timeout) as e:
                print(f"Connection error: {e}")
                raise ValueError(f"Failed to connect to OpenRouter API: {str(e)}")
            except Exception as e:
                print(f"Unexpected error: {e}")
                raise ValueError(f"Unexpected error: {str(e)}")
                
            return full_response
        else:
            # --- 非流式输出模式 ---
            try:
                response = requests.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=headers,
                    json=data,
                    timeout=30,  # 添加超时
                    verify=True  # 确保SSL验证
                )
                
                response.raise_for_status()  # 如果状态码不是2xx，则引发HTTPError

                return response.json()["choices"][0]["message"]["content"]
            except (requests.exceptions.SSLError, requests.exceptions.ConnectionError, requests.exceptions.Timeout) as e:
                print(f"Connection error in non-streaming mode: {e}")
                raise ValueError(f"Failed to connect to OpenRouter API: {str(e)}")
            except requests.exceptions.RequestException as e:
                print(f"Request failed in non-streaming mode: {e}")
                raise ValueError(f"Request to OpenRouter API failed: {str(e)}")

    @property
    def _identifying_params(self) -> Mapping[str, Any]:
        """Get the identifying parameters."""
        return {
            "model": self.model,
            "temperature": self.temperature
        }


class InteractiveLearningAssistant:
    def __init__(self, api_key, model="anthropic/claude-3-opus"):
        """
        Initialize Interactive Learning Assistant using LangChain.

        Args:
            api_key: OpenRouter API key
            model: Model to use
        """
        self.api_key = api_key
        self.model = model
        self.llm = OpenRouterLLM(
            api_key=api_key,
            model=model,
            temperature=0.2
        )
        self.memory = ConversationBufferMemory(return_messages=True)
        self._initialize_chains()

    def set_streaming_callback(self, callback):
        """
        Set a callback function to handle streaming output.

        Args:
            callback: Function that takes a string chunk as input
        """
        self.llm.streaming_callback = callback

    def update_model(self, model):
        """
        Update the model used by the assistant.

        Args:
            model: New model name
        """
        self.model = model
        # Preserve the streaming callback if it exists
        streaming_callback = getattr(self.llm, 'streaming_callback', None)

        self.llm = OpenRouterLLM(
            api_key=self.api_key,
            model=model,
            temperature=0.2
        )

        # Restore the streaming callback
        if streaming_callback:
            self.llm.streaming_callback = streaming_callback

        # 重新初始化所有链以使用新的LLM
        self._initialize_chains()

    def _initialize_chains(self):
        """Initialize all the LangChain chains needed for the assistant."""

        # 初始引导链 - 用于分析问题并提供有价值的初始指导
        initial_guidance_template = """
        You are an Interactive Programming Learning Assistant with expertise in algorithmic problem-solving.
        Your goal is to provide insightful analysis and helpful guidance to students.

        # Initial Problem Analysis

        Problem: {problem}
        Language: {language}
        User Context: {skill_level}

        ## CRITICAL INSTRUCTIONS:
        - START by analyzing the problem: identify the core challenge, key requirements, and potential approaches
        - Provide 2-3 specific insights about the problem (patterns, data structures, algorithms that might be relevant)
        - Give concrete guidance on how to approach this type of problem
        - End with ONE focused question that helps them take the next step
        - Keep your response helpful and concise (max 150 words)
        - Be encouraging and constructive
        - Focus on being genuinely helpful rather than just asking questions

        ## Response Structure:
        1. **Problem Analysis:** (What type of problem this is, key challenges)
        2. **Approach Suggestions:** (Specific techniques or strategies)
        3. **Next Step:** (One clear question to guide them forward)

        Provide valuable analysis first, then guide them with one thoughtful question.
        """

        initial_guidance_prompt = PromptTemplate(
            input_variables=["problem", "language", "skill_level"],
            template=initial_guidance_template
        )

        # Use new RunnableSequence syntax instead of deprecated LLMChain
        self.initial_guidance_chain = initial_guidance_prompt | self.llm

        # 对话继续链 - 用于持续对话
        conversation_continuation_template = """
        You are an Interactive Programming Learning Assistant with expertise in algorithmic problem-solving.
        You're currently engaged in a step-by-step conversation with a student about solving a programming problem.

        # Conversation Context

        Problem: {problem}
        Language: {language}
        User Skill Level: {skill_level}
        Current Stage: {current_stage}
        Conversation History:
        {conversation_history}

        Student's Latest Response: {student_response}

        ## CRITICAL INSTRUCTIONS:
        - DO NOT solve the problem for the student.
        - Keep your response brief (max 150 words).
        - Respond directly to the student's latest input.
        - Ask ONE follow-up question to guide their thinking to the next step.
        - If they're stuck, provide a small hint that guides but doesn't give away the solution.
        - If they have a misconception, ask a Socratic question to help them discover the issue.
        - Match the technical level to their skill level.
        - Your goal is to maintain an engaging dialogue that leads to learning through discovery.

        Respond conversationally as a helpful tutor would, keeping the student engaged and moving forward in their thinking process.
        """

        conversation_continuation_prompt = PromptTemplate(
            input_variables=["problem", "language", "skill_level", "current_stage", "conversation_history",
                             "student_response"],
            template=conversation_continuation_template
        )

        self.conversation_continuation_chain = conversation_continuation_prompt | self.llm

        # 阶段转换链 - 用于在学习阶段之间平滑过渡
        stage_transition_template = """
        You are an Interactive Programming Learning Assistant with expertise in algorithmic problem-solving.
        You're guiding a student through solving a programming problem step-by-step.

        # Stage Transition Guidance

        Problem: {problem}
        Language: {language}
        User Skill Level: {skill_level}
        Previous Stage: {previous_stage}
        New Stage: {new_stage}
        Progress Summary: {progress_summary}

        ## CRITICAL INSTRUCTIONS:
        - Create a brief transition message (max 100 words) between learning stages.
        - Acknowledge what was accomplished in the previous stage.
        - Briefly explain the purpose of the new stage.
        - Ask ONE targeted question to begin the new stage.
        - Keep the tone encouraging and supportive.
        - DO NOT solve any part of the problem for the student.
        - Include a simple emoji relevant to the new stage at the beginning of your message.

        Write a concise, energizing transition that maintains learning momentum while shifting focus to the new stage.
        """

        stage_transition_prompt = PromptTemplate(
            input_variables=["problem", "language", "skill_level", "previous_stage", "new_stage", "progress_summary"],
            template=stage_transition_template
        )

        self.stage_transition_chain = stage_transition_prompt | self.llm

        # 代码反馈链 - 回归苏格拉底式引导
        code_feedback_template = """
        You are an expert programming tutor who uses the Socratic method to guide students.
        Your goal is to help students find and fix their own bugs, not to give them the answers.

        # Socratic Code Feedback

        Problem: {problem}
        Language: {language}
        User Skill Level: {skill_level}
        Student's Code: {student_code}

        ## CRITICAL INSTRUCTIONS:
        - **NEVER provide the correct code or a direct solution.**
        - **DO NOT point out the exact line number of the error.** Your goal is to help them think, not just spot mistakes.
        - Start by acknowledging their effort and finding something positive to say about their code.
        - If there is a logic error, gently point towards the area of the issue and ask a guiding question. For example: "That's a good start. I see you're using nested loops to check pairs. Have you considered what happens with the range of your loops? Does it cover all necessary elements?"
        - If the code is functionally correct but inefficient (e.g., a brute-force solution for a problem that has an optimal O(n) solution), first praise them for finding a working solution. Then, ask a question to prompt them to think about optimization. For example: "Excellent, this solution works! Now, can you think of a way to solve this without using nested loops? Perhaps a data structure could help you remember numbers you've already seen?"
        - If the code is correct and optimal, confirm it and praise their work. You can then suggest exploring edge cases or alternative implementations.
        - Your response should be a short, encouraging paragraph followed by ONE guiding question.
        - Keep your response under 100 words.

        Guide the student to their own "aha!" moment. Be a coach, not a code-corrector.
        """

        code_feedback_prompt = PromptTemplate(
            input_variables=["problem", "language", "skill_level", "current_stage", "student_code"],
            template=code_feedback_template
        )

        self.code_feedback_chain = code_feedback_prompt | self.llm

        # 概念解释链 - 用于解释学生请求的特定编程概念
        concept_explanation_template = """
        You are an Interactive Programming Learning Assistant with expertise in algorithmic problem-solving.

        # Concept Explanation

        Concept to explain: {concept}
        Language: {language}
        User Skill Level: {skill_level}
        Current Problem Context: {problem}

        ## CRITICAL INSTRUCTIONS:
        - Explain the requested concept clearly and concisely (max 150 words).
        - Adapt explanation complexity to the student's skill level.
        - Include a very small, simple code example (3-5 lines) demonstrating the concept.
        - Relate the concept back to the current problem if relevant, but DO NOT solve the problem.
        - Include one thought-provoking question at the end about applying this concept.
        - Your explanation should illuminate understanding, not provide direct solutions.
        - For visual concepts, use text-based visualization if helpful (e.g., trees, arrays).

        Explain the concept in a way that promotes understanding, rather than just providing information.
        """

        concept_explanation_prompt = PromptTemplate(
            input_variables=["concept", "language", "skill_level", "problem"],
            template=concept_explanation_template
        )

        self.concept_explanation_chain = concept_explanation_prompt | self.llm

        # 提示生成链 - 用于提供小提示而不是完整解决方案
        hint_generation_template = """
        You are an Interactive Programming Learning Assistant with expertise in algorithmic problem-solving.

        # Hint Generation

        Problem: {problem}
        Language: {language}
        User Skill Level: {skill_level}
        Current Stage: {current_stage}
        Specific Hint Request: {hint_request}
        Progress So Far: {progress_summary}

        ## CRITICAL INSTRUCTIONS:
        - Provide exactly ONE small, targeted hint (max 70 words).
        - The hint should nudge them forward without revealing the solution.
        - Never provide actual code that solves the problem or major components.
        - For beginners: more concrete direction but still requires thinking.
        - For intermediate: point to a concept or approach, but leave implementation details open.
        - For advanced: very subtle hint about algorithm strategy or optimization direction.
        - Format as a question or suggestion that promotes discovery, not a direct answer.
        - If they're asking for a complete solution, gently redirect with a thinking prompt instead.

        Create a hint that gives just enough information to help them progress without doing the thinking for them.
        """

        hint_generation_prompt = PromptTemplate(
            input_variables=["problem", "language", "skill_level", "current_stage", "hint_request", "progress_summary"],
            template=hint_generation_template
        )

        self.hint_generation_chain = LLMChain(
            llm=self.llm,
            prompt=hint_generation_prompt,
            output_key="hint"
        )

        # 进度总结链 - 用于总结学生迄今为止的进展
        progress_summary_template = """
        You are an Interactive Programming Learning Assistant with expertise in algorithmic problem-solving.

        # Progress Summary

        Problem: {problem}
        Language: {language}
        User Skill Level: {skill_level}
        Conversation History:
        {conversation_history}

        ## CRITICAL INSTRUCTIONS:
        - Create a very brief summary (max 100 words) of the student's progress so far.
        - Identify key insights or approaches the student has discovered or discussed.
        - Note any specific challenges or misconceptions that have been addressed.
        - DO NOT include any new solutions or approaches not already mentioned by the student.
        - Focus on what the STUDENT has accomplished, not what you have explained.
        - Write in a third-person analytical style (not directly addressing the student).

        Provide an objective assessment of the current state of the student's understanding and progress on the problem.
        """

        progress_summary_prompt = PromptTemplate(
            input_variables=["problem", "language", "skill_level", "conversation_history"],
            template=progress_summary_template
        )

        self.progress_summary_chain = LLMChain(
            llm=self.llm,
            prompt=progress_summary_prompt,
            output_key="progress_summary"
        )

        # 微型挑战创建链 - 创建与当前问题相关的小型挑战
        mini_challenge_template = """
        You are an Interactive Programming Learning Assistant with expertise in algorithmic problem-solving.

        # Mini-Challenge Creation

        Problem: {problem}
        Language: {language}
        User Skill Level: {skill_level}
        Current Stage: {current_stage}
        Focus Area: {focus_area}

        ## CRITICAL INSTRUCTIONS:
        - Create a small, focused coding challenge related to the current problem or concept.
        - The challenge should take less than 5 minutes to solve.
        - It should test understanding of a specific concept relevant to the main problem.
        - Include a clear, brief problem statement (max 50 words).
        - Provide 2-4 multiple choice options OR ask for a very small code snippet (max 3 lines).
        - Include the correct answer (marked as "CORRECT_ANSWER: ") and a brief explanation (marked as "EXPLANATION: ").
        - These markers should not be visible to the student - they'll be extracted programmatically.
        - The challenge difficulty should match the student's skill level.
        - This should help with a specific concept needed for the main problem without solving it.

        Design a mini-challenge that reinforces learning through active practice of a relevant concept.
        """

        mini_challenge_prompt = PromptTemplate(
            input_variables=["problem", "language", "skill_level", "current_stage", "focus_area"],
            template=mini_challenge_template
        )

        self.mini_challenge_chain = LLMChain(
            llm=self.llm,
            prompt=mini_challenge_prompt,
            output_key="mini_challenge"
        )

    def get_initial_guidance(self, problem: str, language: str, skill_level: str) -> str:
        """
        Generate initial problem analysis and guidance for the student.

        Args:
            problem: The programming problem description
            language: The programming language
            skill_level: User's learning context or skill level

        Returns:
            Initial analysis with helpful insights and one focused question
        """
        result = self.initial_guidance_chain.invoke({
            "problem": problem,
            "language": language,
            "skill_level": skill_level
        })
        return result

    def continue_conversation(self, problem: str, language: str, skill_level: str,
                              current_stage: str, conversation_history: str,
                              student_response: str) -> str:
        """
        Generate a response to continue the conversation with the student.

        Args:
            problem: The programming problem description
            language: The programming language
            skill_level: User's skill level
            current_stage: The current learning stage
            conversation_history: Prior conversation formatted as text
            student_response: The student's latest response

        Returns:
            AI response to continue the conversation
        """
        result = self.conversation_continuation_chain.invoke({
            "problem": problem,
            "language": language,
            "skill_level": skill_level,
            "current_stage": current_stage,
            "conversation_history": conversation_history,
            "student_response": student_response
        })
        return result

    def generate_stage_transition(self, problem: str, language: str, skill_level: str,
                                  previous_stage: str, new_stage: str, progress_summary: str) -> str:
        """
        Generate a transition message between learning stages.

        Args:
            problem: The programming problem description
            language: The programming language
            skill_level: User's skill level
            previous_stage: The stage being completed
            new_stage: The stage being transitioned to
            progress_summary: Summary of progress so far

        Returns:
            Transition message to the new stage
        """
        result = self.stage_transition_chain.invoke({
            "problem": problem,
            "language": language,
            "skill_level": skill_level,
            "previous_stage": previous_stage,
            "new_stage": new_stage,
            "progress_summary": progress_summary
        })
        return result

    def provide_code_feedback(self, problem: str, language: str, skill_level: str,
                              current_stage: str, student_code: str) -> str:
        """
        Provide direct, actionable feedback on student's code.

        Args:
            problem: The programming problem description
            language: The programming language
            skill_level: User's skill level
            current_stage: The current learning stage
            student_code: The code submitted by the student

        Returns:
            Direct feedback with specific issues, solutions, and improvements
        """
        result = self.code_feedback_chain.invoke({
            "problem": problem,
            "language": language,
            "skill_level": skill_level,
            "current_stage": current_stage,
            "student_code": student_code
        })
        return result

    def explain_concept(self, concept: str, language: str, skill_level: str, problem: str) -> str:
        """
        Explain a programming concept in the context of the current problem.

        Args:
            concept: The concept to explain
            language: The programming language
            skill_level: User's skill level
            problem: The current programming problem for context

        Returns:
            Explanation of the concept
        """
        result = self.concept_explanation_chain.invoke({
            "concept": concept,
            "language": language,
            "skill_level": skill_level,
            "problem": problem
        })
        return result

    def generate_hint(self, problem: str, language: str, skill_level: str,
                      current_stage: str, hint_request: str, progress_summary: str) -> str:
        """
        Generate a small hint without giving away the solution.

        Args:
            problem: The programming problem description
            language: The programming language
            skill_level: User's skill level
            current_stage: The current learning stage
            hint_request: Specific area the student needs help with
            progress_summary: Summary of progress so far

        Returns:
            A hint that guides without solving
        """
        result = self.hint_generation_chain({
            "problem": problem,
            "language": language,
            "skill_level": skill_level,
            "current_stage": current_stage,
            "hint_request": hint_request,
            "progress_summary": progress_summary
        })
        return result["hint"]

    def summarize_progress(self, problem: str, language: str, skill_level: str,
                           conversation_history: str) -> str:
        """
        Summarize the student's progress so far.

        Args:
            problem: The programming problem description
            language: The programming language
            skill_level: User's skill level
            conversation_history: The conversation history as text

        Returns:
            A summary of the student's progress
        """
        result = self.progress_summary_chain({
            "problem": problem,
            "language": language,
            "skill_level": skill_level,
            "conversation_history": conversation_history
        })
        return result["progress_summary"]

    def create_mini_challenge(self, problem: str, language: str, skill_level: str,
                              current_stage: str, focus_area: str) -> dict:
        """
        Create a mini-challenge related to the current problem.

        Args:
            problem: The programming problem description
            language: The programming language
            skill_level: User's skill level
            current_stage: The current learning stage
            focus_area: Specific area to focus the challenge on

        Returns:
            A dictionary containing the challenge, correct answer, and explanation
        """
        result = self.mini_challenge_chain({
            "problem": problem,
            "language": language,
            "skill_level": skill_level,
            "current_stage": current_stage,
            "focus_area": focus_area
        })

        # Extract components from the result
        raw_challenge = result["mini_challenge"]

        # Parse to extract the correct answer and explanation
        correct_answer = ""
        explanation = ""
        challenge_text = ""

        lines = raw_challenge.split('\n')
        in_challenge = True

        for line in lines:
            if line.startswith("CORRECT_ANSWER:"):
                in_challenge = False
                correct_answer = line.replace("CORRECT_ANSWER:", "").strip()
            elif line.startswith("EXPLANATION:"):
                explanation = line.replace("EXPLANATION:", "").strip()
            elif in_challenge:
                challenge_text += line + "\n"

        return {
            "challenge": challenge_text.strip(),
            "correct_answer": correct_answer,
            "explanation": explanation
        }

    def generate_learning_summary(self, problem: str, language: str, skill_level: str,
                                conversation_history: str) -> str:
        """
        Generate a comprehensive learning summary for the completed problem.

        Args:
            problem: The original programming problem
            language: Programming language used
            skill_level: Student's skill level
            conversation_history: Complete conversation history

        Returns:
            A comprehensive learning summary message
        """
        # 首先检查是否已经初始化了学习总结链
        if not hasattr(self, 'learning_summary_chain'):
            self._initialize_learning_summary_chain()
        
        result = self.learning_summary_chain({
            "problem": problem,
            "language": language,
            "skill_level": skill_level,
            "conversation_history": conversation_history
        })

        return result["summary"]

    def _initialize_learning_summary_chain(self):
        """Initialize the learning summary chain."""
        learning_summary_template = """
        You are an Interactive Programming Learning Assistant. Your task is to generate a comprehensive learning summary for a student who has just completed a programming problem.

        Based on the following information, create a personalized learning summary:

        Problem: {problem}
        Language: {language}
        Student Skill Level: {skill_level}
        
        Complete Learning Journey:
        {conversation_history}

        ## Instructions:
        Create a comprehensive learning summary that includes:

        1. **Problem Overview**: Briefly recap what the student accomplished
        2. **Key Concepts Learned**: List the main programming concepts and techniques covered
        3. **Learning Highlights**: Identify the student's strongest moments and breakthroughs
        4. **Areas of Growth**: Mention areas where the student showed improvement
        5. **Skills Developed**: Technical and problem-solving skills gained
        6. **Next Steps**: Suggest what types of problems or concepts to explore next

        ## Requirements:
        - Be encouraging and celebrate the student's achievement
        - Make it personal based on their actual learning journey
        - Keep it concise but comprehensive (300-400 words)
        - End with congratulations and motivation for continued learning
        - Use a warm, supportive tone that builds confidence

        Generate the learning summary:
        """

        learning_summary_prompt = PromptTemplate(
            template=learning_summary_template,
            input_variables=["problem", "language", "skill_level", "conversation_history"]
        )

        self.learning_summary_chain = LLMChain(
            llm=self.llm,
            prompt=learning_summary_prompt,
            output_key="summary"
        )

    def provide_direct_code_feedback(self, problem: str, language: str, skill_level: str,
                                   current_stage: str, student_code: str) -> str:
        """
        Provide direct, actionable feedback on student's code without Socratic questioning.
        This method gives specific issues, solutions, and improvements immediately.

        Args:
            problem: The programming problem description
            language: The programming language
            skill_level: User's skill level
            current_stage: The current learning stage
            student_code: The code submitted by the student

        Returns:
            Direct feedback with specific issues, solutions, and improvements
        """
        # Use the updated code_feedback_chain which now provides direct feedback
        result = self.code_feedback_chain.invoke({
            "problem": problem,
            "language": language,
            "skill_level": skill_level,
            "current_stage": current_stage,
            "student_code": student_code
        })
        return result




