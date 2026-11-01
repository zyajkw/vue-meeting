"""第 3 步：循环问答，每次仅发送当前问题，不保存历史。"""
import os
from openai import OpenAI

api_key = os.getenv("DEEPSEEK_API_KEY")
if not api_key:
    raise SystemExit("请先设置环境变量 DEEPSEEK_API_KEY。")

with OpenAI(api_key=api_key, base_url="https://api.deepseek.com",
            timeout=60.0, max_retries=0) as client:
    while True:
        user_input = input("\n你（exit 退出）：").strip()
        if user_input.lower() in {"exit", "quit", "退出"}:
            break
        if not user_input:
            continue
        response = client.chat.completions.create(
            model=os.getenv("DEEPSEEK_MODEL", "deepseek-flash"),
            messages=[{"role": "user", "content": user_input}],
            extra_body={"thinking": {"type": "disabled"}},
        )
        print("DeepSeek：", response.choices[0].message.content)
