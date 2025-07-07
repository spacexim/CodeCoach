# backend/main.py
import uvicorn
import uuid  # For generating unique session IDs
import os
import asyncio  # Add as        ctx["conversation_history"].append({"role": "user", "content": f"Please explain the concept of \"{concept}\"."})       ctx["conversation_history"].append({"role": "user", "content": f"Please explain the concept of \"{concept}\"."}):ncio import
from dotenv import load_dotenv
from typing import Dict
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from basic import InteractiveLearningAssistant # Import core class from basic.py

load_dotenv() # Load environment variables from .env file
app = FastAPI()

# 1. Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Define data models
class SessionStartRequest(BaseModel):
    problem: str
    language: str
    skillLevel: str
    model: str

class HintRequest(BaseModel):
    hintRequest: str

class CodeFeedbackRequest(BaseModel):
    code: str

# 3. Session state management (upgraded version)
class Session:
    """Independent session object for each user"""
    def __init__(self, api_key: str, model: str = "anthropic/claude-3.7-sonnet"):
        self.assistant = InteractiveLearningAssistant(
            api_key=api_key,
            model=model
        )
        self.problem_context: dict = {}

# Use dictionary to store all sessions, key is session_id (string), value is Session object
SESSIONS: Dict[str, Session] = {}

# 4. HTTP endpoint: Start new session
@app.post("/api/start_session")
async def start_session(request: SessionStartRequest):
    try:
        # Read API Key from environment variable
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            raise ValueError("OPENROUTER_API_KEY environment variable not found")

        session_id = str(uuid.uuid4())

        # Create Session using the read key and selected model
        new_session = Session(api_key=api_key, model=request.model)
        
        # Initialize problem context
        new_session.problem_context = {
            "problem": request.problem,
            "language": request.language,
            "skill_level": request.skillLevel,
            "conversation_history": [],
            "current_stage": "problem_analysis"
        }
        
        # Get initial guidance
        initial_guidance = new_session.assistant.get_initial_guidance(
            problem=request.problem,
            language=request.language,
            skill_level=request.skillLevel
        )
        
        # Store in conversation history
        new_session.problem_context["conversation_history"].append({"role": "assistant", "content": initial_guidance})
        
        # Store new session in global session dictionary
        SESSIONS[session_id] = new_session
        
        print(f"Session started, ID: {session_id}")
        # 将 session_id 和初始消息一起返回给前端
        return {"success": True, "sessionId": session_id, "message": initial_guidance}
    
    except Exception as e:
        print(f"Failed to start session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# 4.5. HTTP 端点：解释一个概念
@app.get("/api/session/{session_id}/explain/{concept}")
async def explain_concept(session_id: str, concept: str):
    """
    根据会话ID和概念名称，调用AI生成解释。
    """
    current_session = SESSIONS.get(session_id)
    if not current_session:
        raise HTTPException(status_code=404, detail="Session not found.")

    try:
        # 从当前会话的上下文中获取必要的信息
        ctx = current_session.problem_context
        
        # 调用 assistant 的 explain_concept 方法
        # 注意：这是一个非流式的、一次性的请求
        explanation = current_session.assistant.explain_concept(
            concept=concept,
            language=ctx["language"],
            skill_level=ctx["skill_level"],
            problem=ctx["problem"]
        )
        
        # 将用户的请求和AI的解释都添加到对话历史中，以便上下文连续
        ctx["conversation_history"].append({"role": "user", "content": f"请你解释一下“{concept}”这个概念。"})
        ctx["conversation_history"].append({"role": "assistant", "content": explanation})
        
        return {"success": True, "explanation": explanation}

    except Exception as e:
        print(f"Failed to explain concept, Session ID: {session_id}, Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# 4.6. HTTP 端点：请求一个提示
@app.post("/api/session/{session_id}/hint")
async def request_hint(session_id: str, request: HintRequest):
    """
    根据用户卡住的具体问题，生成一个提示。
    """
    current_session = SESSIONS.get(session_id)
    if not current_session:
        raise HTTPException(status_code=404, detail="Session not found.")

    try:
        ctx = current_session.problem_context

        # 1. 生成当前的进度总结，为生成提示提供更丰富的上下文
        history_text = "\n".join([f"{msg['role']}: {msg['content']}" for msg in ctx["conversation_history"]])
        progress_summary = current_session.assistant.summarize_progress(
            problem=ctx["problem"],
            language=ctx["language"],
            skill_level=ctx["skill_level"],
            conversation_history=history_text
        )

        # 2. 调用 assistant 的 generate_hint 方法
        hint = current_session.assistant.generate_hint(
            problem=ctx["problem"],
            language=ctx["language"],
            skill_level=ctx["skill_level"],
            current_stage=ctx["current_stage"],
            hint_request=request.hintRequest,
            progress_summary=progress_summary
        )

        # 3. 将用户的请求和AI的提示添加到对话历史
        ctx["conversation_history"].append({"role": "user", "content": f"I'm stuck and need a hint: {request.hintRequest}"})
        ctx["conversation_history"].append({"role": "assistant", "content": hint})

        return {"success": True, "hint": hint}

    except Exception as e:
        print(f"Failed to generate hint, Session ID: {session_id}, Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 4.7. HTTP 端点：获取代码反馈
@app.post("/api/session/{session_id}/feedback")
async def get_code_feedback(session_id: str, request: CodeFeedbackRequest):
    """
    接收用户提交的代码，并返回AI的反馈。
    """
    current_session = SESSIONS.get(session_id)
    if not current_session:
        raise HTTPException(status_code=404, detail="Session not found.")

    try:
        ctx = current_session.problem_context
        # 更新当前阶段状态（如果需要）
        ctx["current_stage"] = "implementation"

        feedback = current_session.assistant.provide_code_feedback(
            problem=ctx["problem"],
            language=ctx["language"],
            skill_level=ctx["skill_level"],
            current_stage=ctx["current_stage"],
            student_code=request.code
        )

        # 将代码和反馈都存入对话历史
        user_code_submission_text = f"Here is my code attempt, please give some feedback:\n```{ctx['language'].lower()}\n{request.code}\n```"
        ctx["conversation_history"].append({"role": "user", "content": user_code_submission_text})
        ctx["conversation_history"].append({"role": "assistant", "content": feedback})

        return {"success": True, "feedback": feedback}

    except Exception as e:
        print(f"Failed to get code feedback, Session ID: {session_id}, Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 4.8. HTTP 端点：转换到下一个学习阶段
@app.post("/api/session/{session_id}/stage/next")
async def transition_to_next_stage(session_id: str):
    """
    处理学习阶段的转换，并由AI生成过渡消息。
    """
    current_session = SESSIONS.get(session_id)
    if not current_session:
        raise HTTPException(status_code=404, detail="Session not found.")

    try:
        ctx = current_session.problem_context
        
        # 定义学习阶段的顺序
        learning_stages = ["problem_analysis", "solution_design", "implementation", "testing_refinement", "reflection"]
        
        try:
            current_index = learning_stages.index(ctx["current_stage"])
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid current stage.")

        if current_index >= len(learning_stages) - 1:
            return {"success": False, "message": "Already at the last learning stage.", "newStage": ctx["current_stage"]}

        previous_stage = ctx["current_stage"]
        new_stage = learning_stages[current_index + 1]

        # 1. 生成进度总结
        history_text = "\n".join([f"{msg['role']}: {msg['content']}" for msg in ctx["conversation_history"]])
        progress_summary = current_session.assistant.summarize_progress(
            problem=ctx["problem"], language=ctx["language"], skill_level=ctx["skill_level"], conversation_history=history_text
        )

        # 2. 调用AI生成阶段过渡消息
        transition_message = current_session.assistant.generate_stage_transition(
            problem=ctx["problem"], language=ctx["language"], skill_level=ctx["skill_level"],
            previous_stage=previous_stage, new_stage=new_stage, progress_summary=progress_summary
        )
        
        # 3. 更新后端的会话状态
        ctx["current_stage"] = new_stage
        
        # 4. 将过渡消息添加到对话历史
        ctx["conversation_history"].append({"role": "assistant", "content": transition_message})
        
        # 5. 检查新阶段是否为最后一个阶段
        new_stage_index = learning_stages.index(new_stage)
        is_last_stage = new_stage_index >= len(learning_stages) - 1
        
        return {
            "success": True, 
            "transitionMessage": transition_message, 
            "newStage": new_stage,
            "isLastStage": is_last_stage,
            "stageIndex": new_stage_index,
            "totalStages": len(learning_stages)
        }

    except Exception as e:
        print(f"Failed to transition stage, Session ID: {session_id}, Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 4.9. HTTP 端点：创建一个微型挑战
@app.post("/api/session/{session_id}/challenge")
async def create_mini_challenge(session_id: str):
    """
    根据当前会话状态，生成一个微型挑战。
    """
    current_session = SESSIONS.get(session_id)
    if not current_session:
        raise HTTPException(status_code=404, detail="Session not found.")

    try:
        ctx = current_session.problem_context
        
        # 定义每个阶段对应的挑战焦点领域
        focus_areas = {
            "problem_analysis": "problem understanding and input/output analysis",
            "solution_design": "algorithm design and data structure selection",
            "implementation": "coding implementation and syntax",
            "testing_refinement": "edge cases and error handling",
            "reflection": "code optimization and best practices"
        }
        focus_area = focus_areas.get(ctx["current_stage"], "general programming concepts")

        # 调用 assistant 的 create_mini_challenge 方法
        # 这个方法会返回一个包含 'challenge', 'correct_answer', 'explanation' 的字典
        challenge_data = current_session.assistant.create_mini_challenge(
            problem=ctx["problem"],
            language=ctx["language"],
            skill_level=ctx["skill_level"],
            current_stage=ctx["current_stage"],
            focus_area=focus_area
        )
        
        return {"success": True, "challengeData": challenge_data}

    except Exception as e:
        print(f"Failed to create mini challenge, Session ID: {session_id}, Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 4.8.1. HTTP 端点：完成学习
@app.post("/api/session/{session_id}/complete")
async def complete_learning(session_id: str):
    """
    完成当前问题的学习，生成学习总结，并为开始新问题做准备。
    """
    current_session = SESSIONS.get(session_id)
    if not current_session:
        raise HTTPException(status_code=404, detail="Session not found.")

    try:
        ctx = current_session.problem_context
        
        # 检查是否已经到达最后一个阶段
        if ctx["current_stage"] != "reflection":
            return {"success": False, "message": "Please complete all learning stages before summarizing.", "currentStage": ctx["current_stage"]}

        # 生成学习完成总结
        history_text = "\n".join([f"{msg['role']}: {msg['content']}" for msg in ctx["conversation_history"]])
        
        # 调用AI生成学习总结
        learning_summary = current_session.assistant.generate_learning_summary(
            problem=ctx["problem"],
            language=ctx["language"],
            skill_level=ctx["skill_level"],
            conversation_history=history_text
        )
        
        # 将总结添加到对话历史
        ctx["conversation_history"].append({"role": "assistant", "content": learning_summary})
        
        # 标记学习状态为已完成
        ctx["learning_completed"] = True
        ctx["completion_time"] = asyncio.get_event_loop().time()
        
        return {
            "success": True, 
            "learningCompleted": True,
            "summary": learning_summary,
            "message": "Congratulations! You have completed learning this problem. You can now start a new problem."
        }

    except Exception as e:
        print(f"Failed to complete learning, Session ID: {session_id}, Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 4.8.2. HTTP 端点：检查学习状态
@app.get("/api/session/{session_id}/status")
async def get_learning_status(session_id: str):
    """
    获取当前学习会话的状态信息。
    """
    current_session = SESSIONS.get(session_id)
    if not current_session:
        raise HTTPException(status_code=404, detail="Session not found.")

    try:
        ctx = current_session.problem_context
        
        # 定义学习阶段的顺序
        learning_stages = ["problem_analysis", "solution_design", "implementation", "testing_refinement", "reflection"]
        
        try:
            current_index = learning_stages.index(ctx["current_stage"])
        except ValueError:
            current_index = 0

        is_last_stage = current_index >= len(learning_stages) - 1
        learning_completed = ctx.get("learning_completed", False)
        
        return {
            "success": True,
            "currentStage": ctx["current_stage"],
            "currentStageIndex": current_index,
            "totalStages": len(learning_stages),
            "isLastStage": is_last_stage,
            "learningCompleted": learning_completed,
            "canTransitionNext": not is_last_stage and not learning_completed,
            "canComplete": is_last_stage and not learning_completed
        }

    except Exception as e:
        print(f"Failed to get learning status, Session ID: {session_id}, Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 5. WebSocket 端点：现在路径中包含 session_id
@app.websocket("/ws/chat/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    
    # 根据 session_id 从字典中查找对应的会话
    current_session = SESSIONS.get(session_id)
    
    if not current_session:
        await websocket.send_json({"type": "error", "content": "Invalid session ID. Please restart."})
        await websocket.close()
        return

    try:
        while True:
            user_message = await websocket.receive_text()
            
            # 使用当前会话的上下文
            ctx = current_session.problem_context
            ctx["conversation_history"].append({"role": "user", "content": user_message})

            async def streaming_callback(chunk: str):
                if chunk:
                    await websocket.send_json({"type": "chunk", "content": chunk})

            current_session.assistant.set_streaming_callback(streaming_callback)
            
            history_text = "\n".join([f"{msg['role']}: {msg['content']}" for msg in ctx["conversation_history"][:-1]])

            ai_full_response = current_session.assistant.continue_conversation(
                problem=ctx["problem"],
                language=ctx["language"],
                skill_level=ctx["skill_level"],
                current_stage=ctx["current_stage"],
                conversation_history=history_text,
                student_response=user_message
            )
            
            ctx["conversation_history"].append({"role": "assistant", "content": ai_full_response})

            # 添加小的延迟确保所有流式内容都已发送
            await asyncio.sleep(0.1)
            await websocket.send_json({"type": "end"})

    except WebSocketDisconnect:
        print(f"Client disconnected, Session ID: {session_id}")
        # 可以在这里添加清理逻辑，比如一段时间后从 SESSIONS 字典中移除这个会话
    except Exception as e:
        print(f"WebSocket error, Session ID: {session_id}, Error: {e}")
        await websocket.send_json({"type": "error", "content": str(e)})

# 启动服务器的代码
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)