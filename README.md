# ⚡ FixFlow: Precision Electronics Lab & Repair Shop Management System

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite 8](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=for-the-badge)](https://opensource.org/licenses/Apache-2.0)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](https://github.com/)

> **A Reactive, Role-Enforced Enterprise Platform for Component-Level Hardware Diagnostics, Real-Time Parts Inventory Depletion, Bangladeshi Commerce (BDT ৳) POS Cashiering, and Public Anti-Fraud Warranty Verification.**

Developed & Deployed by **Dayem Sakib** (`dayem.sakib2002@gmail.com`) during a 12-week software engineering internship at **FixFlow Technologies & Precision Electronics Lab**, Banani, Dhaka, Bangladesh.

---

## 📸 Visual Showcase & System Tour

### 1. Executive Workshop Dashboard & KPI Suite
*Comprehensive real-time command center providing active repair metrics, lab revenue in BDT ৳, pending QA queue, low-stock alerts, Kanban status pipeline, and recent repair orders.*

![FixFlow Executive Workshop Dashboard](public/images/dashboard_overview.jpg)

- **Live Metrics Cards:** Instant tracking of Active Repairs, Monthly Workshop Revenue (৳485,200), Pending QA devices, and Critical Low-Stock Parts.
- **Embedded Kanban Board:** Real-time visibility into Intake, Diagnosing, Repairing, and Ready for Pickup states.
- **Recent Repair Orders:** Tabular view with customer info, assigned technician avatars, current state badge, and quick actions.

---

### 2. 9-Stage Finite State Machine Kanban Pipeline
*Strictly governed repair workflow that eliminates status jumping, enforces customer quote approvals before micro-soldering, and guarantees independent quality assurance.*

![FixFlow 9-Stage Repair Pipeline Kanban](public/images/repair_pipeline.jpg)

- **9 Enforced States:** `RECEIVED` → `DIAGNOSING` → `WAITING_FOR_APPROVAL` → `APPROVED` → `WAITING_FOR_PARTS` → `IN_REPAIR` → `QUALITY_CHECK` → `READY_FOR_PICKUP` → `DELIVERED`.
- **Card Metadata:** High-res device photos, customer contact details, ticket ID, diagnostic symptom, assigned technician avatar, and priority indicators.
- **Invariant Validation:** Technicians cannot begin repair work until customer formally approves the itemized estimate.

---

### 3. Precision Diagnostic & Micro-Soldering Bench Suite
*Hardware technician interface bridging software tracking with physical laboratory instruments: thermal imaging hotspot detection and digital multimeter voltage rail readings.*

![FixFlow Hardware Diagnostic & Thermal Bench](public/images/diagnostic_bench.jpg)

- **FLIR PCB Thermal Imaging:** Live thermal inspection view pinpointing logic board hotspots (e.g., Audio Codec IC at 68.4°C).
- **Digital Multimeter (DMM) Voltage Readouts:** Probing readouts for 3.3V Rail, 5V Bus, and VDD_MAIN line with automated Short-Circuit detection.
- **Bench Diagnostic Checklist:** Verification items for PMIC, Backlight circuits, NAND Flash, and Audio ICs.
- **Micro-Soldering Log Notes:** Timestamped lab notes detailing chip removal, trace jumper rebuilds, and solder paste specs.

---

### 4. Parts Inventory Warehouse & POS Invoicing
*Real-time component warehouse tracking tied directly to workbench consumption, paired with a full-featured Point of Sale (POS) cashiering engine.*

![FixFlow Parts Inventory and POS Billing](public/images/pos_inventory.jpg)

- **Automatic Stock Depletion:** Stock decrements automatically the exact second a technician adds a component (OLED screen, BGA IC, thermal paste) to a ticket.
- **Low Stock Warning Badges:** Amber/Red alerts when inventory falls below minimum safety thresholds.
- **Itemized POS Billing:** Multi-line billing calculating part subtotal, technician bench fee, and 15% VAT.
- **Multi-Method Bangladeshi Cashiering:** Native support for **Cash**, **bKash**, **Nagad**, **POS Card**, and **Bank Wire**.

---

### 5. Public Customer Self-Service Tracking Portal
*Customer-facing online portal allowing clients to track their device repair progress in real time and verify 90-day laboratory warranty certificates without needing to call the front desk.*

![FixFlow Public Customer Tracking Portal](public/images/customer_portal.jpg)

- **Dual-Factor Public Lookup:** Search by Ticket ID (e.g., `TKT-2026-089`) and Customer Phone Number.
- **Live Progress Milestones:** Visual timeline showing Received, Diagnosing, Approved, Repairing, QC Testing, and Ready for Pickup.
- **Intake Damage Photo Audit:** High-resolution intake photos documenting existing scratches/dents to eliminate false liability claims.
- **Cryptographic Warranty Certificate:** Generates a verifiable 90-day lab warranty certificate with an anti-tamper QR code.

---

### 6. 4-Layer System Architecture & Engineering Flowchart
*High-performance, event-driven reactive web architecture engineered for sub-millisecond screen updates, zero flickers, and clean separation of concerns.*

![FixFlow System Architecture Flowchart](public/images/system_architecture.jpg)

- **Layer 1: Client & Presentation:** React 19 SPA, TypeScript, Tailwind CSS v4, Lucide React Iconography, and Custom Print CSS.
- **Layer 2: State & Governance:** Event-driven Storage Bus, Reactive Window Event Dispatchers, and Role-Based Access Control (RBAC).
- **Layer 3: Business Logic Engines:** 9-Stage FSM Invariant Validator, Real-Time Parts Depletion Engine, and BDT POS Tax Calculator.
- **Layer 4: Persistence Layer:** Relational schemas (22 entities), localStorage caching, and REST-ready async API contracts.

---

## 🎯 The Problem FixFlow Solves

Traditional consumer electronics repair shops and micro-soldering labs face severe operational bottlenecks:

| Traditional Workshop Problem | Impact on Business | FixFlow Engineered Solution |
|:---|:---|:---|
| **Manual Paper Job Tickets** | Slips tear, get stained by flux/alcohol, or lost. | **100% Digital Lifecycle** with QR tracking and audit logs. |
| **Parts Shrinkage** | Expensive ICs and OLEDs vanish from shelves. | **Real-Time Warehouse Depletion** on technician bench allocation. |
| **Customer Quote Disputes** | 34% of repairs face verbal quote disagreements at checkout. | **Pre-Repair Digital Estimates** with formal customer sign-off. |
| **Secondary Fault Rework** | 22% rework rate from fixing one fault but missing another. | **Non-Bypassable 7-Point Hardware QC Inspection** checklist. |
| **Warranty Fraud** | Forged paper receipts and fabricated claims. | **Public Cryptographic Warranty Portal** with live verification. |

---

## 🚀 Key Features & Capabilities

- [x] **Strict 9-Stage Repair Finite State Machine:** Invariant checks guarantee no repair proceeds without approved estimates.
- [x] **Component-Level Diagnostics Logging:** Thermal hotspot logging, multimeter diode mode readings, and boardview trace tracking.
- [x] **Automated Warehouse Inventory Depletion:** Real-time stock decrement, SKU barcode scanning, and safety stock threshold warnings.
- [x] **Multi-Line Estimate & Customer Approval Workflow:** Itemized breakdown of genuine parts, labor tiers, and taxes.
- [x] **7-Point Post-Repair Quality Assurance Gate:** Mandatory tests for touch grid, cameras, charging amps draw, audio, RF, chassis, and thermals.
- [x] **Bangladeshi Commerce & POS Cashiering:** Native `৳` BDT currency formatting, split billing across Cash, bKash, Nagad, POS Card, and Bank Wire.
- [x] **Dual Print Engine (@media print):** Instant generation of **80mm thermal receipt rolls** for ESC/POS counter printers and **A4 professional customer invoices**.
- [x] **Public Anti-Fraud Warranty Verification:** Self-service lookup for consumers with QR validation and PII masking.
- [x] **Interactive Academic Defense & Reports Hub:** Embedded 12-chapter comprehensive internship report viewer and 21-slide presentation viewer with word-for-word speaker notes.
- [x] **One-Click Document Export:** Download defense reports and slide decks in both Markdown (`.md`) and Microsoft Word (`.doc`) formats.

---

## 🛡️ Role-Based Access Control (RBAC) Matrix

FixFlow enforces zero-trust permission boundaries across 4 distinct user roles:

| Module / Operation | ADMIN | TECHNICIAN | CASHIER | CUSTOMER |
|:---|:---:|:---:|:---:|:---:|
| **Dashboard KPIs & Financials** | Full Access | Hidden | Summary | Hidden |
| **Customer Device Intake** | Full Access | Read Only | Full Access | Self Intake |
| **Hardware Diagnosis & Thermal Log** | Full Access | Create / Edit | View Only | View Symptoms |
| **Estimate Generation** | Full Access | Create Draft | Send to Client | Approve / Decline |
| **Micro-Soldering & Repair Execution** | Full Access | Execute / Update | Hidden | Track Status |
| **Parts Inventory Stock Adjustment** | Full Access | Allocate to Ticket | View Only | Hidden |
| **7-Point Quality Assurance Sign-Off** | Full Access | Submit for Review | Read Only | View QC Pass |
| **POS Billing & Payment Settlement** | Full Access | Hidden | Process (BDT ৳) | View Receipt |
| **Public Warranty Verification** | Full Access | Read Only | Verify Slip | Public Self-Service |

---

## 🛠️ Technology Stack & Dependencies

| Category | Technology / Library | Version | Rationale |
|:---|:---|:---:|:---|
| **Framework** | React | `^19.0.1` | Ultra-fast concurrent rendering & state reconciliation |
| **Language** | TypeScript | `^7.0.2` | Static type safety across 22 relational domain entities |
| **Build Engine** | Vite | `^8.3.0` | Sub-second cold starts and rapid module resolution |
| **Styling** | Tailwind CSS | `^4.3.3` | Utility-first responsive UI with zero CSS bloat |
| **Icons** | Lucide React | `^0.546.0` | Clean, modern iconography matching lab hardware |
| **Animation** | Motion (Framer Motion) | `^12.23.24` | Smooth status transition cues and modal animations |
| **Server Runtime** | Node.js & Express | `^4.21.2` | REST API routes & static file delivery |
| **Tooling** | TSX & ESBuild | `^4.21.0` | TypeScript execution without slow compilation steps |

---

## 📂 Project Directory Structure

```text
fixflow/
├── public/
│   ├── images/
│   │   ├── dashboard_overview.jpg      # Executive Workshop Dashboard
│   │   ├── repair_pipeline.jpg         # 9-Stage FSM Kanban Board
│   │   ├── diagnostic_bench.jpg        # Micro-Soldering Bench & Thermal UI
│   │   ├── pos_inventory.jpg           # Inventory Warehouse & POS Invoicing
│   │   ├── customer_portal.jpg         # Public Self-Service Tracking Portal
│   │   └── system_architecture.jpg     # 4-Layer Engineering Architecture
│   ├── PROJECT_INTERNSHIP_REPORT.md    # 12-Chapter Academic Internship Report
│   └── PROJECT_PRESENTATION_SLIDES.md  # 21 Defense Slides with Speaker Scripts
│
├── src/
│   ├── components/
│   │   ├── layout/                     # Sidebar, Header, Breadcrumbs, PageLayout
│   │   ├── print/                      # A4 Invoice & 80mm Thermal Receipt layouts
│   │   └── ui/                         # Badge, Button, Card, Input, Modal primitives
│   │
│   ├── pages/
│   │   ├── dashboard/                  # KPI metrics, Kanban queue, activity charts
│   │   ├── repairs/                    # Ticket creation, diagnosis bench, FSM pipeline
│   │   ├── parts/                      # Inventory warehouse, SKU search, stock alerts
│   │   ├── estimates/                  # Digital estimate builder & customer approval
│   │   ├── invoices/                   # Multi-item invoice generator & BDT cashiering
│   │   ├── payments/                   # Payment settlement (Cash, bKash, Card, Bank)
│   │   ├── warranties/                 # Public anti-fraud warranty verification portal
│   │   ├── customers/                  # Customer CRM & repair history records
│   │   ├── technicians/                # Bench workload & specialization management
│   │   ├── products/                   # Supported device models & repair catalog
│   │   └── reports/                    # Academic Defense Hub, Slide Viewer, Report Viewer
│   │
│   ├── lib/
│   │   ├── downloadDocument.ts         # One-click .md and .doc export helper
│   │   └── utils.ts                    # BDT ৳ currency & date formatting utilities
│   │
│   ├── services/
│   │   └── storageService.ts           # Pub/Sub reactive event bus & persistence engine
│   │
│   ├── stores/                         # UI state, active role, toast notifications
│   ├── types/                          # TypeScript domain schemas (Ticket, Part, Invoice)
│   ├── App.tsx                         # Root routing and application providers
│   ├── main.tsx                        # Application mount point
│   └── index.css                       # Global styles & Tailwind v4 imports
│
├── metadata.json                       # Applet configuration & metadata
├── package.json                        # Dependencies and npm scripts
├── tsconfig.json                       # Strict TypeScript compiler configuration
├── vite.config.ts                      # Vite build & alias configuration
└── README.md                           # This comprehensive documentation file
```

---

## ⚡ Quick Start & Installation

Follow these steps to run FixFlow on your local machine:

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm** or **pnpm** package manager

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/fixflow-repair-system.git
cd fixflow-repair-system
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start the Development Server
```bash
npm run dev
```
Open your browser and navigate to **`http://localhost:3000`**.

### 5. Build for Production
To create an optimized, minified production bundle:
```bash
npm run build
```

---

## 🎓 Academic Internship & Defense Deliverables

FixFlow was developed as a Capstone Internship Project adhering strictly to university engineering requirements:

- **Student / Candidate:** Dayem Sakib
- **Student ID:** `CSE-2026-INT-042`
- **Degree:** Bachelor of Science in Computer Science & Engineering (B.Sc. in CSE)
- **Host Organization:** FixFlow Technologies & Precision Electronics Lab, Level 4, Plot 18, Road 11, Banani C/A, Dhaka-1213, Bangladesh.
- **Academic Documents Included:**
  - `PROJECT_INTERNSHIP_REPORT.md` — Complete 12-chapter, 35+ KB academic report (IEEE / university compliant).
  - `PROJECT_PRESENTATION_SLIDES.md` — 21-slide defense deck with visual ASCII layouts, metric boxes, and word-for-word speaker notes.
  - Interactive **Document & Presentation Viewers** accessible directly in the running app under the **Reports** navigation menu.

---

## 📄 License & Attribution

This project is licensed under the **Apache License 2.0** — see the [LICENSE](LICENSE) file for details.

### Developed with Pride by:
**Dayem Sakib**  
Full-Stack Software Engineer  
Email: [dayem.sakib2002@gmail.com](mailto:dayem.sakib2002@gmail.com)  
Banani, Dhaka, Bangladesh

*Special thanks to the engineering team and senior micro-soldering technicians at FixFlow Technologies Lab for their guidance during the 12-week internship.*
