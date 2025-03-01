/*
  Warnings:

  - Added the required column `type` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AccountTypes" AS ENUM ('CHECKING', 'SAVINGS', 'INVESTMENT');

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "type" "AccountTypes" NOT NULL;
