"""第 4 步：50 行最小 Agent，保存历史并调用本地 SHA-256 工具。"""
import os, json, hashlib
from openai import OpenAI

api_key = os.getenv("DEEPSEEK_API_KEY")
if not api_key:
    raise SystemExit("请先设置环境变量 DEEPSEEK_API_KEY。")
tools = [{"type": "function", "function": {
    "name": "sha256_text", "description": "计算文本的 SHA-256，按 UTF-8 编码。",
    "parameters": {"type": "object", "properties": {"text": {"type": "string"}},
                   "required": ["text"], "additionalProperties": False}}}]
messages = [{"role": "system", "content":
             "你是区块链学习助手。计算哈希必须使用工具，准确保留原文大小写与空格。"}]
with OpenAI(api_key=api_key, base_url="https://api.deepseek.com",
            timeout=60.0, max_retries=0) as client:
    while True:
        question = input("\n你（exit 退出）：").strip()
        if question.lower() in {"exit", "quit", "退出"}:
            break
        if not question:
            continue
        turn_start = len(messages)
        messages.append({"role": "user", "content": question})
        for _ in range(5):  # 每个问题最多请求模型 5 次，避免无限调用。
            response = client.chat.completions.create(
                model=os.getenv("DEEPSEEK_MODEL", "deepseek-flash"),
                messages=messages, tools=tools,
                extra_body={"thinking": {"type": "disabled"}})
            message = response.choices[0].message
            messages.append(message.model_dump(exclude_none=True))
            if not message.tool_calls:
                print("DeepSeek：", message.content)
                break
            for call in message.tool_calls:
                try:
                    if call.function.name != "sha256_text":
                        raise ValueError("未知工具")
                    args = json.loads(call.function.arguments)
                    if not isinstance(args, dict) or set(args) != {"text"}:
                        raise ValueError("参数必须且只能包含 text")
                    if not isinstance(args["text"], str):
                        raise ValueError("text 必须是字符串")
                    result = hashlib.sha256(args["text"].encode("utf-8")).hexdigest()
                except (ValueError, TypeError) as error:
                    result = f"工具错误：{error}"
                print(f"[工具 {call.function.name}] {result}")
                messages.append({"role": "tool", "tool_call_id": call.id, "content": result})
        else:
            print("达到本轮调用上限，已清除本轮记录，请缩小问题后重试。")
            del messages[turn_start:]
