# Abnormal AI - Shadow IT Security 

This repository contains an interactive Shadow IT detection and management dashboard built for the Abnormal AI – Senior Product Manager, Shadow IT Security Module take-home assignment. It showcases product thinking, UX flows, and a realistic security analyst / CISO experience for an AI-native cybersecurity platform.

Live app: https://v0-abnormal-shadow-it.vercel.app

**🧩 What This Prototype Does**

The app simulates an AI-powered Shadow IT Security Module that helps security teams:
- Discover unauthorized / risky OAuth apps connected to a SaaS tenant
- Assess risk using a Shadow IT Risk Score, scopes, vendor context, and user behavior
- Triage and remediate issues via guided workflows that don’t break productivity
- Give CISOs an executive-ready overview of risk posture and trends

It is meant as a product + UX demo, not a production detection engine.

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

