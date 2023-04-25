<div align="center">

<h1 align="center">AutoGPT-Next-Web</h1>

English / [简体中文](./README_CN.md)

One-Click to deploy well-designed AutoGPT-Next-Web web UI on Vercel.

一键免费部署你的私人 AutoGPT-Next-Web 网页应用。

[Demo](https://auto-agentgpt.com/) / [Issues](https://github.com/Dogtiti/AutoGPT-Next-Web/issues) / [Join Discord](https://discord.gg/Xnsbhg6Uvd) / [Buy Me a Coffee](https://www.buymeacoffee.com/elricliu)

[演示](https://auto-agentgpt.com/) / [反馈](https://github.com/Dogtiti/AutoGPT-Next-Web/issues) / [QQ 群](https://user-images.githubusercontent.com/38354472/232797111-d34a81b0-2739-4251-82b6-6093dc0eb0b6.png) / [微信](https://user-images.githubusercontent.com/38354472/232797309-9348f3a6-1dd7-422a-ad01-935247b1970e.png) / [知识星球](https://user-images.githubusercontent.com/38354472/232797482-c42222ff-74f9-4519-ba6f-752288dbe262.png) / [打赏开发者](https://user-images.githubusercontent.com/38354472/232796654-c749602b-c1d4-402b-8c31-e7c013b7a42d.png)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FDogtiti%2FAutoGPT-Next-Web&env=OPENAI_API_KEY&project-name=autogpt-next-web&repository-name=AutoGPT-Next-Web)

![cover](./public/cover-en.png)

</div>

## Discuss with us

![cover](https://user-images.githubusercontent.com/38354472/232792153-683125c9-33bf-492f-ac6b-fbaab8c7b46e.png)

## Features

- Free one-click deployment with Vercel in 1 minute
- UI designed to match AgentGPT, responsive design, and support for dark mode
- Extremely fast first screen loading speed
- Have your own domain? Even better, after binding, you can quickly access it anywhere without barriers.

### Docker Setup

The easiest way to run AutoGPT-Next-Web locally is by using docker.
A convenient setup script is provided to help you get started.

```bash
./setup.sh --docker
```

### Local Development Setup

If you wish to develop AutoGPT-Next-Web locally, the easiest way is to
use the provided setup script.

```bash
./setup.sh --local
```

### Manual Setup

> You will need [Nodejs +18 (LTS recommended)](https://nodejs.org/en/) installed.

1. Fork this project:

- [Click here](https://github.com/Dogtiti/AutoGPT-Next-Web/fork).

2. Clone the repository:

```bash
git clone git@github.com:YOU_USER/AutoGPT-Next-Web.git
```

3. Install dependencies:

```bash
cd AutoGPT-Next-Web
npm install
```

4. Create a **.env** file with the following content:

> The environment variables must match the following [schema](https://github.com/Dogtiti/AutoGPT-Next-Web/blob/main/src/env/schema.mjs).

```bash
# Deployment Environment:
NODE_ENV=development

# Next Auth config:
# Generate a secret with `openssl rand -base64 32` or visit https://generate-secret.vercel.app/
NEXTAUTH_SECRET=''
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=file:./db.sqlite

# Your open api key
OPENAI_API_KEY=''
```

5. Modify prisma schema to use sqlite:

```bash
./prisma/useSqlite.sh
```

**Note:** This only needs to be done if you wish to use sqlite.

6. Ready, now run:

```bash
# Create database migrations
npx prisma db push
npm run dev
```
