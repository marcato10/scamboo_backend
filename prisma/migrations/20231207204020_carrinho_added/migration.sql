/*
  Warnings:

  - You are about to drop the column `listaDeDesejosId` on the `Oferta` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Carrinho" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL
);

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
    "localizacao" TEXT,
    "categoria" TEXT,
    "estadoProduto" TEXT,
    "listaDeDesejosId" INTEGER,
    "carrinhoId" INTEGER,
    CONSTRAINT "Anuncio_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Anuncio_listaDeDesejosId_fkey" FOREIGN KEY ("listaDeDesejosId") REFERENCES "ListaDeDesejos" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Anuncio_carrinhoId_fkey" FOREIGN KEY ("carrinhoId") REFERENCES "Carrinho" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Anuncio" ("categoria", "descricao", "estaAberto", "estadoProduto", "id", "listaDeDesejosId", "localizacao", "periodoDias", "titulo", "trocaTemporaria", "vendedorId") SELECT "categoria", "descricao", "estaAberto", "estadoProduto", "id", "listaDeDesejosId", "localizacao", "periodoDias", "titulo", "trocaTemporaria", "vendedorId" FROM "Anuncio";
DROP TABLE "Anuncio";
ALTER TABLE "new_Anuncio" RENAME TO "Anuncio";
CREATE TABLE "new_Oferta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "compradorId" INTEGER NOT NULL,
    "vendedorId" INTEGER NOT NULL,
    "anuncioId" INTEGER NOT NULL,
    "oferta" TEXT NOT NULL,
    "aceito" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Oferta_anuncioId_fkey" FOREIGN KEY ("anuncioId") REFERENCES "Anuncio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Oferta" ("aceito", "anuncioId", "compradorId", "id", "oferta", "vendedorId") SELECT "aceito", "anuncioId", "compradorId", "id", "oferta", "vendedorId" FROM "Oferta";
DROP TABLE "Oferta";
ALTER TABLE "new_Oferta" RENAME TO "Oferta";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
