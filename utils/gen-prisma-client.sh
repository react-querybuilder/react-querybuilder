bunx prisma generate --schema ./packages/core/src/utils/formatQuery/prisma/schema.prisma
bunx prisma generate --schema ./packages/datetime/src/prisma/schema.prisma
# Add "any" type to all generated exports to be compatible with `isolatedDeclarations` TypeScript compiler option
find packages/{core/src/utils/formatQuery,datetime/src}/prisma/generated -name "*.ts" -type f -exec sed -i -E "s/^export const ([^:]+) = /export const \1: any = /" {} +
