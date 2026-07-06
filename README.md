# Courtfees Frontend

ระบบคำนวณค่าธรรมเนียมศาล (ค่าขึ้นศาล) และค่าป่วยการอนุญาโตตุลาการ สำหรับศาลจังหวัดและศาลแขวง — React + Vite + Chakra UI

> ⚠️ ค่าใช้จ่ายที่คำนวณได้เป็นเพียงการประมาณการเท่านั้น ไม่สามารถใช้อ้างอิงในการดำเนินคดีจริงได้

## Features

- **ค่าขึ้นศาล** — คำนวณค่าธรรมเนียมศาลจังหวัด/ศาลแขวง รองรับคดีมีทุนทรัพย์ คดีไม่มีทุนทรัพย์ คดีบังคับจำนอง อุทธรณ์/ฎีกา และคดีผสม (13 ประเภทคดี)
- **ค่าป่วยการอนุญาโตตุลาการ** — คำนวณค่าป่วยการสำหรับอนุญาโตตุลาการ 1 คนหรือมากกว่า แยกแสดงผลฝั่งผู้เรียกร้องและผู้คัดค้าน
- **ตารางอัตราค่าธรรมเนียม** — ตารางอัตราอ้างอิงสำหรับค่าขึ้นศาลและค่าป่วยการ

## Tech Stack

- [React 19](https://react.dev/) + [React Router 7](https://reactrouter.com/)
- [Vite 6](https://vitejs.dev/)
- [Chakra UI 3](https://chakra-ui.com/)
- Nginx (production static hosting via Docker)

## Getting Started

```bash
npm install
npm run dev
```

แอปจะรันที่ `http://localhost:5173` โดย request ที่ขึ้นต้นด้วย `/api` จะถูก proxy ไปยัง backend ที่ `http://localhost:8080` (ดู [vite.config.js](vite.config.js))

### Scripts

| Command           | Description              |
| ------------------ | ------------------------ |
| `npm run dev`       | เริ่ม dev server (Vite)   |
| `npm run build`     | build สำหรับ production   |
| `npm run preview`   | preview build ที่ได้      |

## Project Structure

```
src/
├── assets/         # รูปภาพตารางอัตราค่าธรรมเนียม
├── components/     # Layout, CollapsibleSection ฯลฯ
├── pages/          # HomePage, CourtFeesPage, ArbitrationPage, RateTablePage
├── utils/
│   └── feeCalculations.js   # สูตรคำนวณค่าธรรมเนียม (ported จาก courtfees-backend)
├── App.jsx         # Route definitions
└── main.jsx        # Entry point
```

## Docker

Build และรันด้วย Nginx:

```bash
docker compose up --build
```

แอปจะเปิดให้บริการที่ `http://localhost:3000` (ดู [Dockerfile](Dockerfile), [docker-compose.yml](docker-compose.yml), [nginx.conf](nginx.conf))
