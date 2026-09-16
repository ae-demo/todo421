/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Template for tests/e2e/lib/targets.ts in the project repo.
//
// Resolves component base URLs for specs. The committed source of truth
// is tests/e2e/targets.json (written from the validation issue's
// "Deployed endpoints" table); an AEP_E2E_TARGET_<NAME> env var wins
// over the file, so the same committed specs can be pointed at a
// different environment without editing the repo
// (e.g. AEP_E2E_TARGET_HELLO_WEB=http://host.docker.internal:5173).

import { readFileSync } from "node:fs";
import path from "node:path";

interface TargetsFile {
  // component name -> base URL, e.g. {"hello-web": "https://..."}
  targets: Record<string, string>;
  // the component whose URL becomes Playwright's use.baseURL
  primary: string;
}

// __dirname: Playwright transpiles these TS files as CommonJS (the
// tests/e2e package deliberately does NOT set "type": "module").
const targetsPath = path.join(__dirname, "..", "targets.json");
const file: TargetsFile = JSON.parse(readFileSync(targetsPath, "utf8"));

function envKey(name: string): string {
  return `AEP_E2E_TARGET_${name.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`;
}

export function target(name: string): string {
  const fromEnv = process.env[envKey(name)];
  const url = fromEnv ?? file.targets[name];
  if (!url) {
    throw new Error(
      `no target URL for component "${name}": add it to tests/e2e/targets.json or set ${envKey(name)}`,
    );
  }
  return url.replace(/\/+$/, "");
}

export function primaryTarget(): string {
  return target(file.primary);
}
