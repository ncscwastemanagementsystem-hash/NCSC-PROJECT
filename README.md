# NCSC Project Vault

A React + TypeScript project-management vault for organising National Children's Science Congress (NCSC) research materials. The current repository is a **digital project vault**, not the firmware or deployed control software for a physical waste-sorting machine.

## What this repository currently contains

- **Frontend:** React 19, TypeScript, Vite 8 and Tailwind CSS 4.
- **Backend:** Express 4 in `server.ts`, run with `tsx` during development and Node in the configured start script.
- **File handling:** Multer uploads stored under `data/uploads`.
- **Current persistence:** JSON file at `data/vault-db.json`; this is file-based storage, not PostgreSQL or MongoDB.
- **AI integration dependency:** `@google/genai`; configure `GEMINI_API_KEY` only if the relevant application features require it.
- **UI:** `src/App.tsx`, `src/api.ts`, `src/types.ts`, and `src/components/`.

## Repository layout

```text
.
├── server.ts                 # Express API and production Vite hosting
├── package.json              # scripts and dependencies
├── vite.config.ts
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── api.ts                # browser API client (/api/*)
│   ├── types.ts              # shared TypeScript types
│   └── components/           # interface components
├── data/
│   ├── vault-db.json         # JSON database (runtime data)
│   └── uploads/              # created by server at runtime
├── docs/
│   └── PHYSICAL_SORTER_GUIDE.md
└── hardware/
    ├── ai/                   # sensor-feature model starter
    └── esp32/                # optional actuator controller starter
```

## Requirements

- Node.js 20 or newer (Node 22 LTS recommended)
- npm (or Bun, if you prefer the lockfile already present)
- Git

## Run locally

```bash
git clone https://github.com/ncscwastemanagementsystem-hash/NCSC-PROJECT.git
cd NCSC-PROJECT
npm install
npm run dev
```

Open the local URL printed by Vite/Express (normally `http://localhost:3000`).

## Production build and start

```bash
npm install
npm run build
NODE_ENV=production npm start
```

The package scripts currently define `build: vite build` and `start: node server.ts`. If your deployment platform does not run TypeScript entry points directly, change the production start process to compile `server.ts` to JavaScript (or use `tsx server.ts`) and test it on the platform before publishing. Do not assume that the static Vite build alone starts the API.

## Environment variables

See `.env.example`. Variable names currently documented there:

| Name | Purpose |
|---|---|
| `GEMINI_API_KEY` | Gemini API access where used |
| `APP_URL` | Public application URL for generated links/callbacks |
| `PORT` | HTTP port; read by `server.ts`, usually assigned by host |

Never commit real API keys, passwords, session tokens or private credentials. Set them in the hosting provider's secret/environment settings.

## Important persistence and deployment warning

The backend writes data to local JSON and upload directories. On hosts with ephemeral filesystems, records and uploaded files can disappear after redeploy/restart. A single JSON file is also not safe for concurrent multi-instance writes. For a reliable public deployment, migrate structured records to a managed database (for example PostgreSQL) and uploaded files to persistent object storage. Keep backups outside the application container. The checked-in `data/vault-db.json` should be treated as sample/seed data, not a production database.

## Physical Smart Waste-to-Resource research module

The physical sorter is a separate proposed NCSC hardware/AI subsystem. The current React vault does **not** read ESP32 sensors, run YOLOv8, train a Random Forest, or actuate conveyor gates. Starter reference files and safe setup instructions are in:

- [Physical sorter architecture and workflow](docs/PHYSICAL_SORTER_GUIDE.md)
- [Python sensor-feature model](hardware/ai/)
- [ESP32 actuator controller example](hardware/esp32/)

These are prototype starting points. They must be wired, calibrated, tested and validated before use. The ESP32 example does not operate a real conveyor until pin assignments, drivers, guards, emergency stop and interlocks are engineered for the actual machine.

## Suggested development order

1. Run the existing vault locally and confirm login, projects, file upload, experiment log and BOM screens.
2. Back up `data/vault-db.json` and uploads before changing the backend.
3. Test the physical sorting AI offline using labelled CSV readings and images.
4. Add camera inference (YOLOv8n) and sensor synchronisation.
5. Bench-test the ESP32 with LEDs/servo mock loads before connecting actuators.
6. Test each category and the reject path; measure model metrics and physical routing accuracy separately.

## License and safety

Add a license file if you intend others to reuse the code. This repository is an educational project. Do not use it as an industrial waste-processing controller without qualified engineering, electrical protection, guarding, risk assessment and applicable approvals.
