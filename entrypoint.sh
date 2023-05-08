#!/bin/env sh

# change schema.prisma
sed -ie 's/mysql/sqlite/g' prisma/schema.prisma
sed -ie 's/@db.Text//' prisma/schema.prisma

# Add Prisma and generate Prisma client
npx prisma generate
# Generate db when not exists
if [[ ! -f "/app/prisma/${DATABASE_URL:5}" ]]; then
  npx prisma migrate dev --name init
  npx prisma db push
fi

# run cmd
exec "$@"
