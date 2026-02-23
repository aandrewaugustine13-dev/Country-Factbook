# The World Factbook  
**Reference Edition 2026**

A clean, open-source replica of the original CIA World Factbook website (shut down February 2026).  

This site provides authoritative, up-to-date country profiles and statistics for researchers, students, journalists, and the public.

**Live site:** https://country-factbook.vercel.app

## Features
- Search by common or official name  
- Filter by region (Africa, Americas, Asia, Europe, Oceania)  
- Grid and list views  
- Clean, professional country profiles  
- Individual country pages (`/countries/USA`, `/countries/CHN`, etc.)  
- Built with Next.js 15 + Tailwind – fully static and fast  

## Data Sources
- Base country data: REST Countries (public domain)  
- Full Factbook sections (Geography, People & Society, Government, Economy, Energy, Communications, Transportation, Military, Transnational Issues) – coming in v2 from the official open archive: https://github.com/factbook/factbook.json  

## Local Development
```bash
git clone https://github.com/aandrewaugustine13-dev/Country-Factbook.git
cd Country-Factbook
npm install
npx tsx build-data.ts          # fetches all 250 countries
npm run dev
