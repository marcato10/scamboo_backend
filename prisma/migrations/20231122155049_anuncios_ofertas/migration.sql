-- RedefineTables
PRAGMA foreign_keys=OFF;
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
