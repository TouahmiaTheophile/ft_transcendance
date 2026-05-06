#!/bin/sh
set -e

# '--accept-data-loss' allows to force prisma to apply changes that drop datas
npx prisma db push --accept-data-loss

# Generate client
npx prisma generate

exec npm run start