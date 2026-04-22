import { load } from "https://deno.land/std/dotenv/mod.ts";
const env = await load();
console.log("TESTINGGGGG:", env["VITE_FIREBASE_API_KEY"]);