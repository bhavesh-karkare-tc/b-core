import { base, pure } from "@b-core/config/eslint/base";
import { defineConfig } from "eslint/config";

export default defineConfig([...base, ...pure]);
