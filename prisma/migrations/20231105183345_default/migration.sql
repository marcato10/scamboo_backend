/*
  Warnings:

  - You are about to drop the column `imagem` on the `Anuncio` table. All the data in the column will be lost.
  - You are about to drop the column `fotoPerfil` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Anuncio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "vendedorId" INTEGER NOT NULL,
    "estaAberto" BOOLEAN NOT NULL DEFAULT true,
    "trocaTemporaria" BOOLEAN NOT NULL DEFAULT false,
    "periodoDias" INTEGER,
    CONSTRAINT "Anuncio_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Anuncio" ("descricao", "estaAberto", "id", "periodoDias", "titulo", "trocaTemporaria", "vendedorId") SELECT "descricao", "estaAberto", "id", "periodoDias", "titulo", "trocaTemporaria", "vendedorId" FROM "Anuncio";
DROP TABLE "Anuncio";
ALTER TABLE "new_Anuncio" RENAME TO "Anuncio";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL
);
INSERT INTO "new_User" ("email", "id", "nome", "senha") SELECT "email", "id", "nome", "senha" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
