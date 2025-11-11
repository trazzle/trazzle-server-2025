/*
  Warnings:

  - Added the required column `name_kr` to the `country` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "country" ADD COLUMN     "name_kr" TEXT NOT NULL;
