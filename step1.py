"""第 1 步：固定提问，验证 DeepSeek API 调用。"""
import os
from openai import OpenAI

api_key = os.getenv("DEEPSEEK_API_KEY")
if not api_key:
    raise SystemExit("请先设置环境变量 DEEPSEEK_API_KEY。")

with OpenAI(api_key=api_key, base_url="https://api.deepseek.com",
            timeout=60.0, max_retries=0) as client:
    response = client.chat.completions.create(
        model=os.getenv("DEEPSEEK_MODEL", "deepseek-flash"),
        messages=[{"role": "user", "content": "你好！"}],
        extra_body={"thinking": {"type": "disabled"}},
    )
    print("DeepSeek：", response.choices[0].message.content)
