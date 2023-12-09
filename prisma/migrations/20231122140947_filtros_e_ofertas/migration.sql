-- AlterTable
ALTER TABLE "Anuncio" ADD COLUMN "categoria" TEXT;
ALTER TABLE "Anuncio" ADD COLUMN "estadoProduto" TEXT;
ALTER TABLE "Anuncio" ADD COLUMN "localizacao" TEXT;

-- CreateTable
CREATE TABLE "Oferta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "compradorId" INTEGER NOT NULL,
    "vendedorId" INTEGER NOT NULL,
    "anuncioId" INTEGER NOT NULL,
    "oferta" TEXT NOT NULL,
    "aceito" BOOLEAN NOT NULL DEFAULT false
);
