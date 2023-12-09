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
INSERT INTO "new_Anuncio" ("descricao", "id", "titulo", "vendedorId") SELECT "descricao", "id", "titulo", "vendedorId" FROM "Anuncio";
DROP TABLE "Anuncio";
ALTER TABLE "new_Anuncio" RENAME TO "Anuncio";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
