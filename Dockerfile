# 1. 使用官方的 Python 3.11 镜像
FROM python:3.11-slim

# 2. 安装 Rust 编译环境
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# 3. 设置工作目录
WORKDIR /app

# 4. 复制 backend 文件夹中的 requirements.txt
COPY backend/requirements.txt .

# 5. 安装所有 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt

# 6. 复制整个 backend 文件夹到工作目录
COPY backend/ .

# 7. 暴露端口，以便 Render 可以访问
EXPOSE 8000

# 8. 容器启动时运行的命令
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]