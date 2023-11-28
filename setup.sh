#!/bin/bash
cd "$(dirname "$0")" || exit

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

# Get user input for OPENAI_API_KEY
read_variable "${GREEN}Enter your Guest Key (required):${NC} " "^.+$" "NEXT_PUBLIC_GUEST_KEY"

# Get user input for NEXT_PUBLIC_WEB_SEARCH_ENABLED
select_web_search_enabled

echo -e "${GREEN}All required variables set. ✔${NC}"

NEXTAUTH_SECRET=$(openssl rand -base64 32)

ENV="NEXTAUTH_SECRET=$NEXTAUTH_SECRET\n\
NEXTAUTH_URL=http://localhost:3000\n\
OPENAI_API_KEY=$OPENAI_API_KEY\n\
DATABASE_URL=file:./db.sqlite\n\
NEXT_PUBLIC_GUEST_KEY=$NEXT_PUBLIC_GUEST_KEY\n\
SERP_API_KEY=$SERP_API_KEY\n\
NEXT_PUBLIC_WEB_SEARCH_ENABLED=$NEXT_PUBLIC_WEB_SEARCH_ENABLED\n"


printf $ENV > .env

./prisma/useSqlite.sh
npm install
npx prisma db push
npm run dev
