#!/bin/bash
cd "$(dirname "$0")" || exit

is_valid_sk_key() {
  local api_key=$1
  local pattern="^sk-[a-zA-Z0-9]{48}$"
  [[ $api_key =~ $pattern ]] && return 0 || return 1
}

echo -n "Enter your OpenAI Key (eg: sk...) or press enter to continue with no key: "
read OPENAI_API_KEY

if is_valid_sk_key $OPENAI_API_KEY || [ -z "$OPENAI_API_KEY" ]; then
  echo "Valid API key"
else
  echo "Invalid API key. Please ensure that you have billing set up on your OpenAI account"
  exit
fi

echo -n "Enable web search (true/false):"
read NEXT_PUBLIC_WEB_SEARCH_ENABLED

echo -n "Enter your serp api key to use web search :"
read SERP_API_KEY

NEXTAUTH_SECRET=$(openssl rand -base64 32)

ENV="NODE_ENV=development\n\
NEXTAUTH_SECRET=$NEXTAUTH_SECRET\n\
NEXTAUTH_URL=http://localhost:3000\n\
OPENAI_API_KEY=$OPENAI_API_KEY\n\
DATABASE_URL=file:../db/db.sqlite\n\
SERP_API_KEY=$SERP_API_KEY\n\
NEXT_PUBLIC_WEB_SEARCH_ENABLED=$NEXT_PUBLIC_WEB_SEARCH_ENABLED\n"

printf $ENV > .env
./prisma/useSqlite.sh
npm install
npm run dev
