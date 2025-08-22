# EmpowHER – Women’s Safety App

## Team Details
- Team Name: Guardian Angels
- Team Members:
  - [Bhavyyasri Emani]
  - [Megha Yadav]
  - [Damini Verma]
  - [Raushan Kumar]

## Problem Statement
Many women feel unsafe when traveling alone or during emergencies. Quick access to help, sharing precise location, and deterrent tools are often missing or fragmented across apps. EmpowHER aims to provide a single, intuitive safety companion.

## Project Description
EmpowHER is a PWA focused on fast emergency response and prevention:
- SOS flow sends SMS with live location to saved contacts and opens the emergency dialer.
- Quick Actions to trigger a loud Deterrent Alarm (siren + screen flash + optional vibration) instantly.
- Manage Emergency Contacts (name, phone, email) stored locally.
- Report Unsafe Areas with category, description, and current GPS.
- Safety Tips module for awareness.
- Settings to control region, SOS delay, custom emergency number, alarm volume/flash/vibrate, and personal medical details.

## Tech Stack Used
- Vite, React, JavaScript/TypeScript
- Tailwind CSS, shadcn/ui, lucide-react
- @tanstack/react-query

## Installation & Usage
Prereqs: Node.js 18+ and npm

```bash
git clone <this-repo-url>
cd GuardianAngels-EmpowerHer
npm i
npm run dev
```
Open the local URL shown in the terminal (typically http://localhost:5173).

## Live Demo / Deployment
- Live site: https://guardian-angels-empower-her.vercel.app/
- Demo video: https://drive.google.com/file/d/1EmlrusbHLQeS8fbskX3tXHOZDOtwuQpg/view?usp=sharing

## UI/UX / Design Link (if applicable)
- Presentation / design assets (Drive): https://drive.google.com/file/d/1RjVX4E77cB8iQzUWITjkVY419uPFOw2g/view?usp=sharing
- <img width="676" height="1080" alt="image" src="https://github.com/user-attachments/assets/4a34cd66-0ed4-4038-b371-d95bc693f489" />
<img width="676" height="1080" alt="image" src="https://github.com/user-attachments/assets/6af2403e-92fc-42ff-8265-f7a0e154dff0" />



## Future Enhancements
- Offline-first data sync and contact backup.
- Share real-time location with a secure web link.
- Map of crowd-sourced unsafe reports with heat zones.
- Multilingual support and accessibility passes.
- Optional backend to persist reports (today it’s localStorage-only).
