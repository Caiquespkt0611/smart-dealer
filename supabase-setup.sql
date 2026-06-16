-- Smart Dealer - Script de Setup do Banco
-- Cole este SQL no Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- 1. Criar tabelas
CREATE TABLE IF NOT EXISTS "VendaMensal" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "grupo" TEXT NOT NULL,
  "loja" TEXT NOT NULL,
  "modelo" TEXT NOT NULL,
  "mes" INTEGER NOT NULL,
  "ano" INTEGER NOT NULL,
  "quantidade" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "Meta" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "grupo" TEXT NOT NULL UNIQUE,
  "carta" DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS "Estoque" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "grupo" TEXT NOT NULL,
  "loja" TEXT NOT NULL,
  "modelo" TEXT NOT NULL,
  "chao" INTEGER NOT NULL DEFAULT 0,
  "transito" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "LeadMensal" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "referencia" TEXT NOT NULL UNIQUE,
  "leads" INTEGER NOT NULL,
  "leadsUnicos" INTEGER NOT NULL,
  "tempoAtendMin" DOUBLE PRECISION NOT NULL,
  "tcaPct" DOUBLE PRECISION NOT NULL,
  "lcrGrupoPct" DOUBLE PRECISION NOT NULL,
  "diasConversao" DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS "NPSMensal" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "referencia" TEXT NOT NULL,
  "tipo" TEXT NOT NULL,
  "scoreMensal" DOUBLE PRECISION NOT NULL,
  "scoreTrimestral" DOUBLE PRECISION NOT NULL,
  "promotores" DOUBLE PRECISION NOT NULL,
  "neutros" DOUBLE PRECISION NOT NULL,
  "detratores" DOUBLE PRECISION NOT NULL
);

SELECT 'Tabelas criadas com sucesso!' as status;
