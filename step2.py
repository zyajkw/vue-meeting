"""第 2 步：通过 input 接收一次用户提问。"""
import os
from openai import OpenAI

api_key = os.getenv("DEEPSEEK_API_KEY")
if not api_key:
    raise SystemExit("请先设置环境变量 DEEPSEEK_API_KEY。")

with OpenAI(api_key=api_key, base_url="https://api.deepseek.com",
            timeout=60.0, max_retries=0) as client:
    user_input = input("\n你：").strip()
    if not user_input:
        raise SystemExit("输入为空，本次不调用 API。")
    response = client.chat.completions.create(
        model=os.getenv("DEEPSEEK_MODEL", "deepseek-flash"),
        messages=[{"role": "user", "content": user_input}],
        extra_body={"thinking": {"type": "disabled"}},
    )
    print("DeepSeek：", response.choices[0].message.content)
