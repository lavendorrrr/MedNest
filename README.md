# MedNest — Medicine Search & Pharmacy Locator

A full-stack web application for finding medicines at nearby pharmacies, comparing prices, checking real-time stock levels, and contributing to a disease outbreak early-warning system through anonymized search telemetry.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [Environment Variables](#environment-variables)
7. [Available Scripts](#available-scripts)
8. [API Reference](#api-reference)
9. [Data Models & Types](#data-models--types)
10. [Components](#components)
11. [Services Layer](#services-layer)
12. [Deployment](#deployment)
13. [Architecture Notes](#architecture-notes)

---

## Overview

MedNest is built for patients who need to quickly locate a specific medicine in their area. Users can search by brand or generic name, filter results by medical aid, distance, stock status, and opening hours, then view a pharmacy's full inventory — all from a single interface.

On top of the patient-facing search, MedNest includes:

- A **Pharmacy Admin Portal** where pharmacy staff register branches and manage their medicine stock catalog.
- A **Disease Outbreak Radar** that aggregates anonymized search telemetry to detect regional spikes in demand for flu remedies, antibiotics, and antipyretics — acting as an early-warning system for public health.
- A **Gemini AI Symptom Assistant** that accepts plain-language symptom descriptions and recommends matching medicines from the catalog.

The app runs as a single Node.js/Express server that serves the React SPA and exposes a REST API. It also has a **client-side fallback mode** using `localStorage`, allowing it to run as a fully static site on GitHub Pages without any backend.

---

## Features

| Feature | Description |
|---|---|
| Medicine Search | Full-text search by brand name, generic name, or category with live autocomplete |
| Pharmacy Locator | Distance-sorted results using the Haversine formula; supports list and map views |
| Real-time Stock Status | Per-pharmacy inventory with `in_stock`, `low_stock`, `out_of_stock` badges |
| Price Comparison | Sort pharmacies by lowest medicine price |
| Medical Aid Filter | Filter pharmacies by accepted medical aid / insurance scheme |
| Favorites | Save preferred pharmacies to localStorage for quick access |
| AI Symptom Assistant | Describe symptoms in plain language; Gemini AI recommends medicines |
| Disease Outbreak Radar | Anonymized search telemetry aggregated by region; spike alerts generated automatically |
| Pharmacy Admin Portal | Register branches, manage inventory, toggle active/inactive status |
| Map View | Visual map with color-coded pins by stock status |
| Privacy Controls | Users can opt out of anonymized outbreak telemetry at any time |
| Static Fallback | All features work on GitHub Pages via client-side data and localStorage |

---

## Tech Stack

### Frontend
| Library | Version | Purpose |
|---|---|---|
| React | ^19.0.1 | UI framework |
| TypeScript | ~5.8.2 | Type safety |
| Vite | ^6.2.3 | Build tool and dev server |
| Tailwind CSS | ^4.1.14 | Utility-first styling via `@tailwindcss/vite` |
| lucide-react | ^0.546.0 | Icon library |
| motion | ^12.23.24 | Animation library |

### Backend
| Library | Version | Purpose |
|---|---|---|
| Express | ^4.21.2 | HTTP server and REST API |
| @google/genai | ^2.4.0 | Google Gemini AI SDK |
| dotenv | ^17.2.3 | Environment variable loading |
| tsx | ^4.21.0 | TypeScript execution for development |
| esbuild | ^0.25.0 | Bundles `server.ts` for production |

---

## Project Structure

```
mednest/
├── .env.example                  # Environment variable template
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions CI/CD for GitHub Pages
├── index.html                    # Vite entry HTML
├── metadata.json                 # App metadata and permissions
├── package.json
├── server.ts                     # Express API server + Vite dev middleware
├── tsconfig.json
├── vite.config.ts                # Vite configuration
└── src/
    ├── main.tsx                  # React app bootstrap
    ├── App.tsx                   # Root component, app state, routing
    ├── types.ts                  # Shared TypeScript interfaces
    ├── index.css                 # Tailwind base styles
    ├── components/
    │   ├── Navbar.tsx            # Top navigation, location selector
    │   ├── SearchHeader.tsx      # Search bar, filters, sort, view toggle
    │   ├── PharmacyCard.tsx      # Single pharmacy result card
    │   ├── PharmacyDetailModal.tsx  # Full pharmacy inventory modal
    │   ├── MapView.tsx           # Simulated map with pharmacy pins
    │   ├── FavoritesView.tsx     # Saved pharmacies view
    │   ├── AdminPortal.tsx       # Pharmacy staff management portal
    │   ├── OutbreakRadar.tsx     # Disease outbreak telemetry dashboard
    │   ├── AiSymptomModal.tsx    # Gemini AI symptom checker modal
    │   ├── PrivacySettingsModal.tsx  # Telemetry opt-in/out settings
    │   └── TechSpecsView.tsx     # Architecture docs and DB schema viewer
    ├── data/
    │   ├── locations.ts          # Location presets and medical aid list
    │   └── mockData.ts           # Seed data for client-side fallback mode
    └── services/
        └── api.ts                # API client with server and localStorage fallback
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

This starts `server.ts` via `tsx`. Express serves the app and Vite middleware handles HMR at `http://localhost:3000`.

### Production Build

```bash
npm run build
```

Runs `vite build` (bundles the React SPA into `dist/`) then `esbuild` (bundles `server.ts` into `dist/server.cjs`).

### Production Start

```bash
npm start
```

Runs the bundled Express server from `dist/server.cjs`. Serves static files from `dist/`.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values.

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes (for AI features) | Google Gemini API key. Without it, the AI assistant and outbreak report generation fall back to pre-written static responses. |
| `APP_URL` | No | The hosted URL for the application. Used for self-referential links. |

When `GEMINI_API_KEY` is absent, AI endpoints return safe, static fallback guidance without crashing.

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `tsx server.ts` | Starts development server with hot reload |
| `build` | `vite build && esbuild server.ts ...` | Builds frontend SPA and bundles the server |
| `start` | `node dist/server.cjs` | Runs the production server |
| `clean` | `rm -rf dist server.cjs` | Cleans build artifacts |
| `lint` | `tsc --noEmit` | TypeScript type checking |

---

## API Reference

All endpoints are prefixed with `/api`.

### Health

#### `GET /api/health`
Returns server status.

**Response**
```json
{ "status": "ok", "app": "MedNest API" }
```

---

### Medicines

#### `GET /api/medicines?q=<query>`
Returns all medicines, or filters by name, generic name, or category. Used for autocomplete.

**Query Parameters**
| Param | Type | Description |
|---|---|---|
| `q` | string | Search query (optional) |

**Response** — array of `Medicine` objects.

---

### Search

#### `GET /api/search`
Main search endpoint. Returns pharmacies with matching inventory, sorted and filtered.

**Query Parameters**
| Param | Type | Default | Description |
|---|---|---|---|
| `q` | string | `""` | Medicine name or generic name |
| `lat` | number | `-26.2041` | User latitude |
| `lng` | number | `28.0473` | User longitude |
| `max_distance` | number | `50` | Maximum radius in km |
| `medical_aid` | string | — | Filter by accepted medical aid |
| `in_stock` | boolean | `false` | Only show pharmacies with stock |
| `open_now` | boolean | `false` | Only show currently open pharmacies |
| `sort` | string | `distance` | Sort order: `distance`, `price`, `rating` |

**Response** — `SearchResponse` object with `results` array of `SearchResultItem`.

---

### Pharmacies

#### `GET /api/pharmacies`
Lists all pharmacies with distance from user coordinates.

#### `GET /api/pharmacies/:id`
Returns a single pharmacy with its full inventory catalog.

#### `POST /api/pharmacies`
Registers a new pharmacy branch. Body fields: `name`, `address`, `latitude`, `longitude`, `phone`, `opening_hours`, `medical_aids`.

#### `PUT /api/pharmacies/:id`
Updates an existing pharmacy. Accepts any fields from the `Pharmacy` model.

#### `DELETE /api/pharmacies/:id`
Toggles pharmacy active/inactive status (soft delete — does not remove records).

#### `POST /api/pharmacies/:id/inventory`
Adds or updates a medicine in a pharmacy's inventory. Creates the medicine record if it does not exist.

Body fields: `medicine_id` or `medicine_name`, `generic_name`, `category`, `price`, `stock_quantity`, `stock_status`.

---

### Telemetry & Outbreaks

#### `POST /api/search-logs`
Logs an anonymized medicine search. Skipped when `opt_out: true`.

Body: `medicine_name`, `latitude`, `longitude`, `opt_out`, `session_id`.

#### `GET /api/outbreaks`
Aggregates search logs by region and returns outbreak spike alerts.

**Response** — `OutbreakData` object with `regional_breakdown` and `outbreak_alerts`.

---

### AI

#### `POST /api/ai/symptom-assistant`
Sends a symptom description or outbreak report request to Gemini AI.

Body: `prompt` (symptom text), `mode` (`"outbreak_report"` for admin use).

Falls back to pre-written static guidance when `GEMINI_API_KEY` is not set.

**Response**
```json
{
  "guidance": "For flu symptoms, Benylin 4-Flu ...",
  "recommended_medicines": ["Benylin 4-Flu", "Panado"]
}
```

---

## Data Models & Types

Defined in `src/types.ts`.

### `Pharmacy`
```typescript
{
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  opening_hours: { open: string; close: string; days: string };
  medical_aids: string[];
  status: 'active' | 'inactive';
  rating: number;
  featured?: boolean;
}
```

### `Medicine`
```typescript
{
  id: string;
  name: string;           // Brand name, e.g. "Panado"
  generic_name: string;   // e.g. "Paracetamol"
  category: 'Prescription' | 'Over-the-Counter' | 'Chronic Care' | 'First Aid' | 'Vitamins';
  description?: string;
  dosage?: string;
}
```

### `PharmacyMedicine` (inventory junction)
```typescript
{
  pharmacy_id: string;
  medicine_id: string;
  price: number;
  stock_quantity: number;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  last_updated: string;   // ISO 8601
  medicine?: Medicine;    // Joined on read
}
```

### `SearchResultItem`
```typescript
{
  pharmacy: Pharmacy;
  distance_km: number;
  inventory_matches: PharmacyMedicine[];
  matched_medicine: Medicine | null;
  lowest_price: number | null;
}
```

### `SearchLog` (de-identified telemetry)
```typescript
{
  id: string;
  medicine_name: string;
  category?: string;
  latitude: number;
  longitude: number;
  region: string;         // Coarse: "Northern District", "West End", etc.
  timestamp: string;      // ISO 8601
  session_id: string;     // Anonymous hash — no PII
}
```

### `OutbreakAlert`
```typescript
{
  region: string;
  severity: 'HIGH' | 'MODERATE' | 'LOW';
  title: string;
  description: string;
  primary_symptoms: string[];
  total_triggers: number;
}
```

---

## Components

### `Navbar`
Top navigation bar. Renders the MedNest brand, a location preset selector, and navigation buttons for all five views: Search, Saved, Outbreak Radar, Pharmacy Portal, and Tech Specs. Includes a privacy/settings shield button and a mobile sub-bar with location info.

**Key props:** `currentView`, `setCurrentView`, `userLocation`, `setUserLocation`, `favoritesCount`, `openPrivacyModal`, `telemetryOptOut`

---

### `SearchHeader`
The main search control panel. Contains the search input with live autocomplete (fetches `/api/medicines`), quick category chips, a Gemini AI assistant trigger, filter controls (distance slider, medical aid select, in-stock toggle), a sort selector, and a list/map view toggle. The expanded filters panel opens as an overlay modal.

**Key props:** `searchQuery`, `onSearch`, `selectedMedicalAid`, `maxDistance`, `inStockOnly`, `openNowOnly`, `sortBy`, `viewMode`, `onOpenAiAssistant`

---

### `PharmacyCard`
A card in the search results grid. Displays pharmacy name, distance, rating, operating hours, accepted medical aids, and the matched medicine's price and stock status badge. Actions: call pharmacy, get Google Maps directions, or open the detail modal. Heart button toggles favorite status.

**Key props:** `item` (SearchResultItem), `onSelect`, `isFavorite`, `onToggleFavorite`, `searchedMedicineName`

---

### `PharmacyDetailModal`
A full-screen modal showing detailed information about a selected pharmacy. Fetches the full inventory from `/api/pharmacies/:id`. Supports filtering the inventory list by medicine name and category. Includes operating hours, phone link, directions button, and accepted medical aid badges.

**Key props:** `selectedItem`, `onClose`, `isFavorite`, `onToggleFavorite`

---

### `MapView`
A simulated map view rendered in CSS/HTML (no external map SDK required). Uses relative coordinate offsets from the user's center to position pharmacy pins. Pins are color-coded green/amber/red by stock status. Clicking a pin shows a popup banner with price, stock status, and action buttons.

**Key props:** `results`, `userLocation`, `onSelectPharmacy`

---

### `FavoritesView`
Displays the user's saved pharmacies as a grid of `PharmacyCard` components. Includes a "Clear Saved" button and an empty-state illustration when no favorites are saved.

**Key props:** `favoriteItems`, `onSelectPharmacy`, `onToggleFavorite`, `onClearAll`

---

### `AdminPortal`
The pharmacy staff management interface. Left panel lists all registered pharmacy branches with active/inactive status and a toggle button. Right panel shows the selected pharmacy's inventory in a table, an analytics summary (search appearances, stock catalog count, top regional demand), and a form modal for adding/updating medicines.

**Key props:** none (fetches data via `services/api.ts`)

---

### `OutbreakRadar`
The public health surveillance dashboard. Fetches outbreak data from `/api/outbreaks`, displays regional demand spike alert banners with severity labels, and shows a per-region breakdown table of top-searched medicines. Includes a "Generate AI Outbreak Report" button that calls Gemini to produce an epidemiological brief.

**Key props:** none (fetches data internally)

---

### `AiSymptomModal`
A modal for AI-powered symptom-to-medicine matching. The user types a symptom description (or picks a sample prompt), which is sent to `/api/ai/symptom-assistant`. The response shows guidance text and clickable medicine buttons that trigger a search and close the modal.

**Key props:** `isOpen`, `onClose`, `onSelectMedicine`

---

### `PrivacySettingsModal`
Explains how location data and search telemetry are used. Provides a toggle switch to opt in or out of anonymized outbreak surveillance logging. The choice is persisted in `localStorage` under `mednest_opt_out`.

**Key props:** `isOpen`, `onClose`, `telemetryOptOut`, `setTelemetryOptOut`

---

### `TechSpecsView`
A documentation page embedded in the app. Displays the recommended mobile architecture (Flutter/React Native), backend services, and database layer. Shows the full relational database schema for all four tables in a dark-themed code block.

**Key props:** none

---

## Services Layer

`src/services/api.ts` is the API client used by all components. Every function follows the same pattern:

1. Attempt the server API call via `fetch`.
2. On success, return the parsed JSON.
3. On network error or non-OK response, fall back to local data from `localStorage` (seeded from `src/data/mockData.ts`).

This dual-mode design means the app works identically on the Express server and as a static GitHub Pages site.

| Function | Description |
|---|---|
| `searchMedicinesApi` | Searches pharmacies and inventory; main patient-facing query |
| `fetchPharmaciesApi` | Lists all pharmacies for the admin portal |
| `fetchPharmacyDetailApi` | Gets a single pharmacy with its full inventory |
| `createPharmacyApi` | Creates a new pharmacy branch |
| `togglePharmacyStatusApi` | Activates or deactivates a pharmacy |
| `saveInventoryItemApi` | Adds or updates a medicine in a pharmacy's stock |
| `logSearchTelemetryApi` | Logs an anonymized search event; skipped if user opted out |
| `fetchOutbreaksApi` | Returns regional outbreak alerts and telemetry breakdown |
| `analyzeSymptomsWithAiApi` | Calls Gemini AI for symptom matching or outbreak reports |

---

## Deployment

### GitHub Pages (Static Mode)

The GitHub Actions workflow at `.github/workflows/deploy.yml` handles CI/CD automatically on every push to `main`.

**Pipeline steps:**
1. Checkout code
2. Set up Node 20
3. `npm ci`
4. `npm run build` (Vite SPA output to `dist/`)
5. Upload `dist/` as a GitHub Pages artifact
6. Deploy to GitHub Pages

The Vite config sets `base: '/MedNest/'` to match the GitHub Pages repository path.

In static mode, all API calls fall back to the client-side implementation in `src/services/api.ts`. Data is seeded from `src/data/mockData.ts` and persisted in `localStorage`. The Gemini AI features fall back to pre-written static responses.

### Server Mode (Express + Node.js)

For a full-featured deployment with Gemini AI and server-side data persistence:

1. Build the project: `npm run build`
2. Set `GEMINI_API_KEY` in your environment
3. Run: `npm start`

The Express server (`dist/server.cjs`) serves static files from `dist/` and handles all `/api/*` routes. Data is stored in-memory (arrays in `server.ts`) — for production use, replace with a PostgreSQL or Firebase database.

---

## Architecture Notes

### Haversine Distance Calculation
Both `server.ts` and `src/data/mockData.ts` implement the Haversine formula to calculate straight-line distance in kilometers between two GPS coordinates. Results are rounded to one decimal place.

### Dual-mode API Client
The `src/services/api.ts` layer is designed so the frontend never breaks regardless of whether a backend is available. Each API function catches network errors and executes equivalent logic against `localStorage` data. This is what enables the GitHub Pages deployment.

### Outbreak Detection Logic
The outbreak algorithm is simple but effective: search logs are grouped by region, then regions where total searches exceed a threshold (25+) or where flu/antipyretic medicines are heavily searched trigger a `MODERATE` or `HIGH` alert. The thresholds can be tuned in `server.ts` (`/api/outbreaks`) and `src/services/api.ts` (client fallback).

The seed data in `server.ts` pre-populates 42 search log entries for the Northern District to demonstrate a live outbreak spike on first load.

### Privacy by Design
- No names, emails, or device identifiers are stored.
- Session IDs are random numeric hashes with no linkage to user accounts.
- Location is only stored as a coarse region string (e.g. "Northern District"), not exact coordinates.
- Users can opt out via the Privacy Settings modal; when opted out, `logSearchTelemetryApi` returns immediately without making any network call.

### AI Fallback Behavior
If `GEMINI_API_KEY` is missing or the Gemini API returns an error, all AI endpoints return structured static fallback responses so the UI never shows an error state to the user.
