-- CreateTable
CREATE TABLE "Anuncio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "vendedorId" INTEGER NOT NULL,
    CONSTRAINT "Anuncio_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
