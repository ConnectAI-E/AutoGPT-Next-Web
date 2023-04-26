#!/bin/env sh

# copy .env file
[ ! -f .env ] && cp .env.example .env

# change schema.prisma
sed -ie 's/mysql/sqlite/g' prisma/schema.prisma
sed -ie 's/@db.Text//' prisma/schema.prisma

# Add Prisma and generate Prisma client
npx prisma generate
if [[ -f $1 ]]; then
  npx prisma migrate dev --name init
  npx prisma db push
fi

# run cmd
exec "$@"

