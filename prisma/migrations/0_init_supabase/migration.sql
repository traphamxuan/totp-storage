-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";
CREATE SCHEMA IF NOT EXISTS "private";

-- CreateTable
CREATE TABLE "public"."totp" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "secret" TEXT NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "used_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "totp_secret_key" ON "public"."totp"("secret");

-- CreateTable
CREATE TABLE "private"."totp" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "owner_id" UUID NOT NULL,
    "secret" TEXT NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "used_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "totp_owner_id_secret_idx" ON "private"."totp"("owner_id", "secret");
