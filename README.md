# Abnormal AI - Shadow IT Security 

This repository contains an interactive Shadow IT detection and management dashboard built for the Abnormal AI – Senior Product Manager, Shadow IT Security Module take-home assignment. It showcases product thinking, UX flows, and a realistic security analyst / CISO experience for an AI-native cybersecurity platform.

Live app: https://v0-abnormal-shadow-it.vercel.app

---

**🧩 What This Prototype Does**

The app simulates an AI-powered Shadow IT Security Module that helps security teams:
- Discover unauthorized / risky OAuth apps connected to a SaaS tenant
- Assess risk using a Shadow IT Risk Score, scopes, vendor context, and user behavior
- Triage and remediate issues via guided workflows that don’t break productivity
- Give CISOs an executive-ready overview of risk posture and trends

It is meant as a product + UX demo, not a production detection engine.

---

**🎯 Core Personas & Use Cases**

1. Security Operations Analyst
- See a prioritized list of apps with risk scores and categories (AI, Storage, Productivity, etc.)
- Drill into an app to review:
  - Connected users and departments
  - OAuth scopes and data access
  - Risk rationale and AI-style explanation
- Take actions such as:
  - Recommend revoking access
  - Flag for review / exception
  - Add notes or justification
2. CISO / Head of Security
- Get a tenant-level overview of:
  - Shadow IT risk score over time
  - Trend of new OAuth apps and risky categories
  - Top vendors and exposure surface area
- Answer board/auditor questions like:
  - “How many high-risk unsanctioned apps do we have?”
  - “Is our risk trending up or down this quarter?”

---

**🔍 Key Features (Prototype)**

- Shadow IT Overview Dashboard
  - High-level risk score and trend graph
  - Breakdown by risk level (Critical / High / Medium / Low)
  - Quick filters for persona, risk, app category, and department
- App Drawer / Detail Panel
  - Detailed app profile (name, category, vendor, OAuth scopes)
  - User exposure: who’s using it, which teams, what data they touch
  - AI-style risk explanation that describes why the app is risky in human terms
  - Suggested remediation actions (revoke, limit scopes, educate users)
- Persona Switcher
  - Toggle between Security Analyst and CISO views
  - Adjusted copy, metrics, and emphasis to match each persona’s needs
- Realistic Mock Data
  - Synthetic yet believable:
    - App names (Slack, Notion, AI plugins, file-sharing tools, etc.)
    - OAuth scopes (read/write mail, file access, directory data, etc.)
    - Departments and users to simulate exposure
- Designed to feel like a real enterprise tenant with organic Shadow IT creep

---

**🏗️ Tech Stack**

- Framework: Next.js (App Router)
- Language: TypeScript
- UI: Generated and iterated with v0 by Vercel
- Styling: Modern React component + CSS setup (from v0’s design system)
- State / Data: In-memory mock data in the data/ and related modules for:
  - Apps
  - Users / departments
  - Events / trends

This repo is kept in sync with the v0 project and deployed to Vercel.

---

**📁 Project Structure**

High-level folders you’ll see in this repo:
- app/ – Next.js app routes and top-level layouts/pages
- components/ – Reusable UI components (cards, tables, filters, drawers, charts, etc.)
- data/ – Mock data powering apps, users, events, risk scores, and trends
- hooks/ – Custom React hooks to encapsulate UI and state logic
- store/ – Client-side state (filters, selected app, persona, etc.)
- lib/ & utils/ – Utility helpers and shared logic
- styles/ – Global styles and theme configuration
- public/ – Static assets such as logos or potential screenshots

---




