#!/bin/bash

# Color escape sequences
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Check if we are running in a terminal that supports colors
if [ -t 1 ]; then
  # Use colors
  RED=$(printf '\033[31m')
  GREEN=$(printf '\033[32m')
  NC=$(printf '\033[0m')
fi

# Check if a string matches the "sk-" key pattern
is_valid_sk_key() {
  local api_key=$1
  local pattern="^sk-[a-zA-Z0-9]{48}$"
  [[ $api_key =~ $pattern ]] && return 0 || return 1
}

# Set value for NEXT_PUBLIC_WEB_SEARCH_ENABLED
select_web_search_enabled() {
  PS3="${GREEN}Do you want to enable web search?${NC} "
  options=("true" "false")
  select opt in "${options[@]}"; do
    case $opt in
      "true")
        NEXT_PUBLIC_WEB_SEARCH_ENABLED=true
        read_variable "${GREEN}Enter your SERP API Key (required):${NC} " "^.+$" "SERP_API_KEY"
        break
        ;;
      "false")
        NEXT_PUBLIC_WEB_SEARCH_ENABLED=false
        break
        ;;
      *) echo "${RED}Please enter a valid option.${NC}" ;;
    esac
  done
}

# Ask for user input and validate variable values
read_variable() {
  local prompt="$1"
  local pattern="$2"
  local var_name="$3"
  local var_val=""
  while true; do
    read -p "$prompt" var_val
    if [[ -z "$var_val" ]]; then
      echo -e "${RED}Error: Please enter a valid value for $var_name.${NC}"
    elif [[ ! $var_val =~ $pattern ]]; then
      echo -e "${RED}Error: Invalid format for $var_name.${NC}"
    else
      eval "$var_name=$var_val"
      echo -e "${GREEN}$var_name set. ✔${NC}"
      break
    fi
  done
}

# Get user input for OPENAI_API_KEY
read_variable "${GREEN}Enter your OpenAI API Key (required):${NC} " "^sk-[a-zA-Z0-9]{48}$" "OPENAI_API_KEY"

# Get user input for DATABASE_URL
read_variable "${GREEN}Enter your database URL (required):${NC} " "^.+$" "DATABASE_URL"

# Get user input for GITHUB_CLIENT_ID
read_variable "${GREEN}Enter your Github Client ID (required):${NC} " "^.+$" "GITHUB_CLIENT_ID"

# Get user input for GITHUB_CLIENT_SECRET
read_variable "${GREEN}Enter your Github Client Secret (required):${NC} " "^.+$" "GITHUB_CLIENT_SECRET"

# Get user input for NEXT_PUBLIC_WEB_SEARCH_ENABLED
select_web_search_enabled

echo -e "${GREEN}All required variables set. ✔${NC}"

# Generate a random string for NEXTAUTH_SECRET
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Disable guest mode when auth enable
NEXT_PUBLIC_GUEST_KEY=''

# Enable auth
NEXT_PUBLIC_FF_AUTH_ENABLED=true

ENV="NEXT_PUBLIC_FF_AUTH_ENABLED=$NEXT_PUBLIC_FF_AUTH_ENABLED\n\
OPENAI_API_KEY=$OPENAI_API_KEY\n\
DATABASE_URL=${DATABASE_URL}\n\
GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}\n\
GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}\n\
NEXT_PUBLIC_GUEST_KEY=${NEXT_PUBLIC_GUEST_KEY}\n\
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}\n\
SERP_API_KEY=$SERP_API_KEY\n\
NEXT_PUBLIC_WEB_SEARCH_ENABLED=$NEXT_PUBLIC_WEB_SEARCH_ENABLED\n"

printf $ENV > .env.auth


# 模型定义
modelDefinitions="generator client {
  provider = \"prisma-client-js\"
}

datasource db {
  provider     = \"mysql\"
  url          = env(\"DATABASE_URL\")
  relationMode = \"prisma\"
}

// Necessary for Next auth
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model User {
  id             String    @id @default(cuid())
  name           String?
  email          String?   @unique
  emailVerified  DateTime?
  image          String?
  role           String?
  subscriptionId String?   @db.Text
  customerId     String?   @db.Text

  createDate DateTime @default(now())

  accounts Account[]
  sessions Session[]
  Agent    Agent[]

  @@index([email])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Agent {
  id     String @id @default(cuid())
  userId String
  name   String @db.Text
  goal   String @db.Text

  deleteDate DateTime?
  createDate DateTime  @default(now())

  user  User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  tasks AgentTask[]

  @@index([userId, deleteDate, createDate])
}

model AgentTask {
  id      String  @id @default(cuid())
  taskId  String?
  parentTaskId String?
  agentId String
  type    String
  status  String?
  value   String  @db.Text
  info    String? @db.Text
  sort    Int

  deleteDate DateTime?
  createDate DateTime  @default(now())

  agent Agent @relation(fields: [agentId], references: [id], onDelete: Cascade)

  @@index([agentId])
  @@index([type])
}"

# Generate prisma schema
echo "$modelDefinitions" > prisma/schema.prisma
