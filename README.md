# Vue 入门与 DeepSeek 纯前端对话实践

按照四部分学习：框架比较、Node.js 与 npm、50 行工具调用、Vue 聊天页面与 GitHub Pages 发布。

## 第一部分：Vue 的优点与其他框架的区别

### 1.1 前端框架解决什么问题

HTML 负责结构，CSS 负责样式，JavaScript 处理行为。页面复杂后，手动维护 DOM、状态和交互会越来越费力。框架让我们根据数据描述界面，并把重复结构拆成组件。

例如，问答页面需要保存输入、等待状态、回答和错误信息。使用 Vue 的 `ref()` 声明这些状态，模板会在状态变化时更新对应内容。

### 1.2 为什么这次使用 Vue

- 模板接近 HTML，已经学过网页基础的同学容易读懂。
- 响应式状态减少手动查询和更新 DOM 的代码。
- 可以从一个页面逐步扩展到组件、路由和状态管理，初学阶段不用一次引入全部工具。

这些是本课程选择 Vue 的理由，不代表任何项目都应选择 Vue。[Vue 官方入门](https://cn.vuejs.org/guide/quick-start)

### 1.3 Vue、React、Angular、Svelte 比较

| 维度 | Vue | React | Angular | Svelte |
| --- | --- | --- | --- | --- |
| 常见组件写法 | `.vue`，模板配合 JavaScript | 函数组件，通常使用 JSX | TypeScript 类配合模板 | `.svelte`，脚本配合模板 |
| 状态与界面 | `ref`、`reactive` 等响应式 API | `useState` 等 Hook 触发渲染 | Signals 等机制 | Runes 等响应式语法 |
| 项目组织 | 核心框架配合官方路由和状态库 | UI 库配合框架或其他库 | 提供较完整的应用开发体系 | 编译器处理组件，应用框架可用 SvelteKit |
| 本课的学习考虑 | HTML 基础能直接用于模板 | 需要理解 JSX 与 Hook | 需要学习更多框架约定 | 需要理解编译与特定响应式语法 |

参考：[React](https://react.dev/learn)、[Angular](https://angular.dev/overview)、[Svelte](https://svelte.dev/docs/svelte/overview)。

## 第二部分：安装 Node.js，通过 npm 创建并运行 Vue 项目

### 2.1 安装环境

打开终端验证：

```powershell
node -v
npm -v
```

当前 Vue 脚手架要求 Node.js `^20.19.0 || >=22.12.0`。本项目选择 Node 22，版本要求以[官方快速上手](https://cn.vuejs.org/guide/quick-start)为准。Node.js 运行本地开发和构建工具，npm 安装与管理依赖；浏览器运行构建后的页面代码。

### 2.2 从零创建项目

这段用于课堂练习，**在另一个空目录执行**；运行配套项目只需前面的 `npm.cmd ci`，无需再次创建。

```powershell
npm.cmd create vue@latest
```

将项目名设为 `vue-meeting`，选择 JavaScript，其余附加功能先不启用，Router 和 Pinia 也不需要。根据脚手架提示完成后运行：

```powershell
cd vue-meeting
npm.cmd install
npm.cmd run dev
```

打开终端的 Local 地址。修改 `src/App.vue`，保存并观察页面更新。终端按 Ctrl+C 可以停止开发服务。



## 第三部分：结合上次 API 学习，用 50 行代码完成工具调用

### 3.1 四个脚本的递进关系

| 文件 | 学习目标 | 观察方式 |
| --- | --- | --- |
| `step1.py` | 固定问题验证接口 | 运行后观察回复 |
| `step2.py` | 从用户输入获取问题 | 1+1 |
| `step3.py` | 循环问答，每次仅发送当前问题 | 多次提问，但是没有上下文记忆 |
| `step4.py` | 保存历史，执行本地工具并回传 | 1+1；再+1 |

这一部分单独使用 Python 3.10+。先准备终端演示环境（网页不需要这些步骤）：

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

然后用 PowerShell 设置变量并运行：

```powershell
$env:DEEPSEEK_API_KEY = "你的真实密钥"
$env:DEEPSEEK_MODEL = "deepseek-flash"
.\.venv\Scripts\python.exe step1.py
.\.venv\Scripts\python.exe step2.py
.\.venv\Scripts\python.exe step3.py
.\.venv\Scripts\python.exe step4.py
```

逐条执行：Step 1 自动结束，Step 2 回答一次后结束，Step 3 和 Step 4 输入 `exit` 退出后再启动下一个。原有脚本通过环境变量读取配置，**不会自动读取 `.env`**。这些变量只对当前终端及其子进程有效。[DeepSeek 接口说明](https://api-docs.deepseek.com/)

### 3.2 Step 1：固定提问，验证接口

先把问题固定为“你好！”，让程序完成一次请求和打印。此时只关注密钥、接口地址、模型和网络是否配置正确。

下面是 `step1.py` 的完整代码，可以直接对照运行：

```python
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
```

本步重点：

- `OpenAI(...)` 创建客户端，`base_url` 指定请求发送到 DeepSeek。
- `messages` 中只有一条固定的用户消息。
- `response.choices[0].message.content` 取出回复，再用 `print()` 显示。

运行：

```powershell
.\.venv\Scripts\python.exe step1.py
```

演示：运行后无需输入，观察终端是否返回对“你好！”的回答。程序打印后结束。

### 3.3 Step 2：加入用户输入，完成一次问答

在 Step 1 的基础上，用 `input()` 接收用户问题，再用 `user_input` 替换固定的“你好！”。

下面是 `step2.py` 的完整代码，可以直接对照运行：

```python
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
```

本步重点：

- `input()` 等待用户输入，`.strip()` 去掉首尾空白。
- 输入为空时直接结束，避免发送无效请求。
- 仍然只请求一次，回答后程序就结束。

运行：

```powershell
.\.venv\Scripts\python.exe step2.py
```

演示：输入你设置的示例 `1+1`，观察回复。要问第二个问题，需要重新运行脚本。

### 3.4 Step 3：加入循环，连续问答

在 Step 2 外面加上 `while True`，让程序回答后继续等待下一个问题，并提供退出指令。

下面是 `step3.py` 的完整代码，可以直接对照运行：

```python
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
```

本步重点：

- `while True` 重复接收输入和请求模型。
- `exit`、`quit` 或“退出”触发 `break`，空输入触发 `continue`。
- 每一轮都重新创建只含当前问题的 `messages`，因此连续提问不等于保留上下文。

运行：

```powershell
.\.venv\Scripts\python.exe step3.py
```

演示：先输入“我叫小王”，再输入“我叫什么名字？”。第二次请求不包含第一次的姓名，模型无法依据上轮记录得知名字。也可以连续输入 `1+1` 和“再+1”，观察缺少上下文时的表现；模型可能猜测，不能只凭它的回答判断是否保存了历史。

### 3.5 Step 4：保存历史并加入工具调用

在 Step 3 的基础上，把 `messages` 移到循环外，逐轮保存用户消息、模型回复和工具结果；再声明本地工具，增加模型提出调用、Python 执行、结果回传的处理流程。

可以先用你设置的 `1+1`、“再+1”观察上下文，再用“计算文本 abc 的 SHA-256”展示工具调用。加法问题不一定触发工具，本例注册的工具只计算 SHA-256。

1. Python 发送用户问题，同时提供工具名、用途和 JSON Schema。
2. 模型返回 `tool_calls`，其中包含函数名、参数和调用 ID。
3. Python 校验参数，通过 `hashlib` 计算 SHA-256。
4. Python 用 `role="tool"` 和对应 `tool_call_id` 回传结果。
5. 再次调用模型，让它基于工具结果回答。

模型提出调用请求，实际函数由程序执行。这个示例计算本地文本哈希，不查询链上数据，也不发起交易。[DeepSeek 工具调用指南](https://api-docs.deepseek.com/guides/tool_calls/)

### 3.6 Step 4 完整代码：50 行最小 Agent

以下代码对应根目录 `step4.py`，50 行包含注释与空行。它是教学用最小 Agent；本轮最多请求模型五次，达到上限时丢弃本轮记录。接口异常会终止终端脚本，历史只保存在当前进程内。

```python
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
```

### 3.7 Step 4 运行与现场演示

```powershell
.\.venv\Scripts\python.exe step4.py
```

## 第四部分：把 step3.py 的问答做成纯前端聊天页面

这一部分直接使用配套的 Vue 网页，重点演示如何把本地项目发布成别人能打开的网址。网页的使用方式是：输入自己的 API Key，然后开始对话。

### 4.1 第一步：在本地确认网页能运行

“项目根目录”就是存放 `package.json` 的那个文件夹。本次配套项目在 `D:\code\deepseek`，该文件夹内可以看到 `package.json`、`src/` 和 `vite.config.js`。

先打开 PowerShell，进入这个文件夹，再运行网页：

```powershell
cd D:\code\deepseek
npm.cmd ci
npm.cmd run dev
```

如果你把配套项目下载到了其他位置，就把 `cd` 后面的路径换成自己的文件夹路径；路径含空格时用双引号包住。若使用第二部分自行创建的 `vue-meeting` 项目，根目录就是那个 `vue-meeting` 文件夹，部署前还需放入配套网页代码和 `.github/workflows/pages.yml`。

后续构建、Git 提交和推送命令也都在同一个项目根目录执行。

打开终端显示的地址，检查页面。演示完成后按 Ctrl+C 停止，再执行构建：

```powershell
npm.cmd run build
```

构建成功后会生成 `dist/`。GitHub Pages 最终发布的是这些静态文件。

### 4.2 第二步：在 GitHub 创建仓库

1. 登录 GitHub，点击右上角 **+ → New repository**。
2. 仓库名填写 `vue-meeting`，可见性选择 **Public**。
3. 不勾选自动添加 README、.gitignore 或 License，创建一个空仓库。
4. 点击 **Create repository**，复制仓库的 HTTPS 地址。

下面以 `https://github.com/YOUR_USERNAME/vue-meeting.git` 为例，把 `YOUR_USERNAME` 换成自己的用户名。

### 4.3 第三步：把本地代码推送到仓库

确认项目内已有 `.github/workflows/pages.yml`。配套项目已经提供这个文件，它会自动安装依赖、构建网页并发布，不需要手动上传 `dist/`。

第一次发布时，在项目根目录逐条执行：

```powershell
git init
git add .
git status
git commit -m "Add Vue chat page"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/vue-meeting.git
git push -u origin main
```

执行 `git status` 时检查待提交内容，不要包含真实 API Key。首次提交如果提示缺少 Git 姓名或邮箱，按提示配置后继续；推送时按终端或浏览器提示完成 GitHub 登录。如果项目已关联远程仓库，保留原关联，不要重复添加 `origin`。

推送完成后，刷新 GitHub 仓库页面，确认能看到源码和 `.github/workflows/pages.yml`。

### 4.4 第四步：开启 GitHub Pages

在仓库页面依次点击：

1. **Settings**。
2. 左侧的 **Pages**。
3. 在 **Build and deployment** 中，把 **Source** 设为 **GitHub Actions**。

本项目已经有部署工作流，无需再选择模板创建一份。[GitHub Pages 官方设置说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

### 4.5 第五步：运行并查看部署

1. 回到仓库顶部的 **Actions**。
2. 左侧选择 **Deploy Vue to GitHub Pages**。
3. 点击 **Run workflow**，选择 `main`，再点击运行。
4. 打开最新的一次运行，等待 `build` 和 `deploy` 都显示绿色勾号。

以后推送到 `main` 都会自动部署。第一次推送时如果还没有开启 Pages，可能出现失败记录；完成上一步设置后手动运行即可。

### 4.6 第六步：打开并分享网页

返回 **Settings → Pages**，打开页面显示的站点链接。仓库名为 `vue-meeting` 时，通常是：

```text
https://YOUR_USERNAME.github.io/vue-meeting/
```

用另一台设备打开这个地址，输入自己的 API Key，发送一条消息。这样就完成了从本地网页到线上网页的演示。密钥由使用者在页面输入，刷新即清空，不需要放进 GitHub 配置中。

### 4.7 修改后如何更新

修改页面并保存后，在项目根目录执行：

```powershell
git add .
git commit -m "Update chat page"
git push
```

等待 Actions 再次部署成功，然后刷新线上页面查看变化。

如果部署失败，先打开 Actions 中红色的步骤查看错误；如果页面空白或资源 404，检查 `vite.config.js` 中的 `base: './'` 是否保留。本例没有前端路由，使用相对资源路径。[Vite 部署参考](https://vite.dev/guide/static-deploy.html#github-pages)
