#!/bin/env sh

# Ensure DB is available before running Prisma commands
./wait-for-db.sh db 3306

# Add Prisma and generate Prisma client
npx prisma generate
# Generate db when not exists
if [[ ! -f "/app/prisma/${DATABASE_URL:5}" ]]; then
  npx prisma migrate dev --name init
  npx prisma db push
fi

# Generate Prisma client
npx prisma generate

# run cmd
exec "$@"
