# #!/bin/sh
# set -e

# # '--accept-data-loss' allows to force prisma to apply changes that drop datas
# npx prisma db push --accept-data-loss

# # Generate client
# npx prisma generate

# exec npm run start

#!/bin/sh


set -e

# echo "🧹 Reset Prisma state..."

# rm -rf node_modules/.prisma
# rm -rf node_modules/@prisma/client

echo "📦 db push..."
npx prisma db push --accept-data-loss

# echo "⚙️ generate..."
# npx prisma generate

echo "🚀 start app..."
exec npm run start