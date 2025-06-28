# backend/main.py
import uvicorn
import uuid  # 用于生成唯一的会话 ID
import os
import asyncio  # 添加 asyncio 导入
from dotenv import load_dotenv
from typing import Dict
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from basic import InteractiveLearningAssistant # 从 basic.py 导入核心类

load_dotenv() # 加载 .env 文件中的环境变量
app = FastAPI()

# 1. 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. 定义数据模型
class SessionStartRequest(BaseModel):
    
    problem: str
    language: str
    skillLevel: str

class HintRequest(BaseModel):
    hintRequest: str

class CodeFeedbackRequest(BaseModel):
    code: str

# 3. 会话状态管理 (升级版)
class Session:
    """每个用户一个独立的会话对象"""
    def __init__(self, api_key: str):
        self.assistant = InteractiveLearningAssistant(
            api_key=api_key,
            model="anthropic/claude-3.7-sonnet"
        )
        self.problem_context: dict = {}

# 使用字典来存储所有会话，key 是 session_id (字符串), value 是 Session 对象
SESSIONS: Dict[str, Session] = {}

# 4. HTTP 端点：开始新会话
@app.post("/api/start_session")
async def start_session(request: SessionStartRequest):
    try:
        # 从环境变量中读取 API Key
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            raise ValueError("未找到 OPENROUTER_API_KEY 环境变量")

        session_id = str(uuid.uuid4())

        # 使用读取到的 key 创建 Session
        new_session = Session(api_key=api_key)
        
        # 初始化问题上下文
        new_session.problem_context = {
            "problem": request.problem,
            "language": request.language,
            "skill_level": request.skillLevel,
            "conversation_history": [],
            "current_stage": "problem_analysis"
        }
        
        # 获取初始引导语
        initial_guidance = new_session.assistant.get_initial_guidance(
            problem=request.problem,
            language=request.language,
            skill_level=request.skillLevel
        )
        
        # 存入对话历史
        new_session.problem_context["conversation_history"].append({"role": "assistant", "content": initial_guidance})
        
        # 将新会话存入全局会话字典
        SESSIONS[session_id] = new_session
        
        print(f"会话已启动, ID: {session_id}")
        # 将 session_id 和初始消息一起返回给前端
        return {"success": True, "sessionId": session_id, "message": initial_guidance}
    
    except Exception as e:
        print(f"启动会话失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# 4.5. HTTP 端点：解释一个概念
@app.get("/api/session/{session_id}/explain/{concept}")
async def explain_concept(session_id: str, concept: str):
    """
    根据会话ID和概念名称，调用AI生成解释。
    """
    current_session = SESSIONS.get(session_id)
    if not current_session:
        raise HTTPException(status_code=404, detail="会话未找到。")

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
        print(f"解释概念失败, Session ID: {session_id}, Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# 4.6. HTTP 端点：请求一个提示
@app.post("/api/session/{session_id}/hint")
async def request_hint(session_id: str, request: HintRequest):
    """
    根据用户卡住的具体问题，生成一个提示。
    """
    current_session = SESSIONS.get(session_id)
    if not current_session:
        raise HTTPException(status_code=404, detail="会话未找到。")

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
        ctx["conversation_history"].append({"role": "user", "content": f"我卡住了，需要一个提示：{request.hintRequest}"})
        ctx["conversation_history"].append({"role": "assistant", "content": hint})

        return {"success": True, "hint": hint}

    except Exception as e:
        print(f"生成提示失败, Session ID: {session_id}, Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 4.7. HTTP 端点：获取代码反馈
@app.post("/api/session/{session_id}/feedback")
async def get_code_feedback(session_id: str, request: CodeFeedbackRequest):
    """
    接收用户提交的代码，并返回AI的反馈。
    """
    current_session = SESSIONS.get(session_id)
    if not current_session:
        raise HTTPException(status_code=404, detail="会话未找到。")

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
        user_code_submission_text = f"这是我的代码尝试，请给一些反馈：\n```{ctx['language'].lower()}\n{request.code}\n```"
        ctx["conversation_history"].append({"role": "user", "content": user_code_submission_text})
        ctx["conversation_history"].append({"role": "assistant", "content": feedback})

        return {"success": True, "feedback": feedback}

    except Exception as e:
        print(f"获取代码反馈失败, Session ID: {session_id}, Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 4.8. HTTP 端点：转换到下一个学习阶段
@app.post("/api/session/{session_id}/stage/next")
async def transition_to_next_stage(session_id: str):
    """
    处理学习阶段的转换，并由AI生成过渡消息。
    """
    current_session = SESSIONS.get(session_id)
    if not current_session:
        raise HTTPException(status_code=404, detail="会话未找到。")

    try:
        ctx = current_session.problem_context
        
        # 定义学习阶段的顺序
        learning_stages = ["problem_analysis", "solution_design", "implementation", "testing_refinement", "reflection"]
        
        try:
            current_index = learning_stages.index(ctx["current_stage"])
        except ValueError:
            raise HTTPException(status_code=400, detail="当前阶段状态无效。")

        if current_index >= len(learning_stages) - 1:
            return {"success": False, "message": "已经是最后一个学习阶段了。", "newStage": ctx["current_stage"]}

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
        
        return {"success": True, "transitionMessage": transition_message, "newStage": new_stage}

    except Exception as e:
        print(f"阶段转换失败, Session ID: {session_id}, Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 4.9. HTTP 端点：创建一个微型挑战
@app.post("/api/session/{session_id}/challenge")
async def create_mini_challenge(session_id: str):
    """
    根据当前会话状态，生成一个微型挑战。
    """
    current_session = SESSIONS.get(session_id)
    if not current_session:
        raise HTTPException(status_code=404, detail="会话未找到。")

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
        print(f"创建微型挑战失败, Session ID: {session_id}, Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 5. WebSocket 端点：现在路径中包含 session_id
@app.websocket("/ws/chat/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    
    # 根据 session_id 从字典中查找对应的会话
    current_session = SESSIONS.get(session_id)
    
    if not current_session:
        await websocket.send_json({"type": "error", "content": "无效的会话ID。请重新开始。"})
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
        print(f"客户端断开连接, Session ID: {session_id}")
        # 可以在这里添加清理逻辑，比如一段时间后从 SESSIONS 字典中移除这个会话
    except Exception as e:
        print(f"WebSocket 错误, Session ID: {session_id}, Error: {e}")
        await websocket.send_json({"type": "error", "content": str(e)})

# 启动服务器的代码
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)