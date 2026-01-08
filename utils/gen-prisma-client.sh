bunx prisma generate --schema ./packages/core/src/utils/formatQuery/prisma/schema.prisma
# sed -i -E "s/^export const ([a-zA-Z0-9_]+) = /export const \1: any = /" ./packages/core/src/utils/formatQuery/prisma/generated/prisma-client/client.ts
# sed -i -E "s/^export const ([a-zA-Z0-9_]+) = /export const \1: any = /" ./packages/core/src/utils/formatQuery/prisma/generated/prisma-client/internal/prismaNamespace.ts
find packages/core/src/utils/formatQuery/prisma/generated -name "*.ts" -type f -exec sed -i -E "s/^export const ([^:]+) = /export const \1: any = /" {} +
