// Corre las pruebas de integración de la API (tests/api) contra un servidor
// que ya esté corriendo. ESCRIBEN EN LA BASE DE DATOS del .env, así que exigen
// confirmarlo con ALLOW_DB_WRITE_TESTS=1 y nunca deben apuntar a producción.
//
//   PowerShell:  $env:ALLOW_DB_WRITE_TESTS=1; npm run test:api
//   Bash:        ALLOW_DB_WRITE_TESTS=1 npm run test:api
//   Otro server: API_TEST_URL=http://localhost:3100 (por defecto :3000)
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

const envUrl = existsSync(".env")
  ? readFileSync(".env", "utf8").match(/^DATABASE_URL=(.*)$/m)?.[1] ?? ""
  : "";
const dbUrl = process.env.DATABASE_URL || envUrl;
let destino = "(sin DATABASE_URL)";
try {
  const u = new URL(dbUrl.replace(/^"|"$/g, ""));
  destino = `${u.hostname}${u.pathname}`;
} catch {}

console.log(`\nBase de datos: ${destino}`);
console.log(`Servidor:      ${process.env.API_TEST_URL || "http://localhost:3000"}\n`);

if (process.env.ALLOW_DB_WRITE_TESTS !== "1") {
  console.error(
    "Estas pruebas crean y borran datos (prefijo ZZTEST) en esa base.\n" +
      "Confirma que NO es producción y vuelve a correr con ALLOW_DB_WRITE_TESTS=1."
  );
  process.exit(1);
}

const result = spawnSync("npx", ["jest", "--runInBand", "tests/api"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});
process.exit(result.status ?? 1);
