# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Architecture

The CMMG Calendar converter transforms academic schedule JSON data into calendar formats suitable for Google Calendar and Thunderbird.

### Components
- **Data Converter** (`main.py`): Processes `data/QuadroHorarioAluno.json` and generates calendar files
- **Flask API** (`api_server.py`): REST endpoint for JSON upload and analysis at port 5000
- **React Frontend** (`react-app/`): Vite-based UI for file upload and schedule visualization at port 5173
- **Schedule Analyzer** (`analyze_schedule.py`): CLI tool for schedule statistics and analysis
- **Orchestration** (`start_app.sh`): Shell script that launches both backend and frontend services

### Data Flow
1. Input: `data/QuadroHorarioAluno.json` (academic schedule data)
2. Processing: Extract events with dates, times, subjects, and locations
3. Output formats:
   - `output/GoogleAgenda.csv` - CSV format for Google Calendar import
   - `output/ThunderbirdAgenda.ics` - iCalendar format for Thunderbird/other clients

## Common Commands

### Setup Python environment
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Generate calendar files from JSON
```bash
source venv/bin/activate
python main.py
```

### Run schedule analysis in terminal
```bash
source venv/bin/activate
python analyze_schedule.py
```

### Start full application (API + React)
```bash
./start_app.sh
# API: http://localhost:5000
# Frontend: http://localhost:5173
```

### Start Flask API only
```bash
source venv/bin/activate
python api_server.py
```

### Start React development server
```bash
cd react-app
npm install  # first time only
npm run dev
```

### Build React for production
```bash
cd react-app
npm run build
```

### Lint React code
```bash
cd react-app
npm run lint
```

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /analyze` - Upload JSON file for analysis
  - Request: multipart/form-data with file field
  - Response: JSON with schedule statistics (subjects, time slots, locations, etc.)

## Key Functions

### main.py
- `normalize_json_to_csv()`: Converts JSON to Google Calendar CSV format
- `normalize_json_to_ics()`: Converts JSON to iCalendar format
- `create_ics_event()`: Creates individual ICS event entries

### api_server.py  
- `analyze_schedule_data_json()`: Processes uploaded JSON and returns statistics
- Counts events by subject, time slot, location, day of week, and month

### analyze_schedule.py
- Provides terminal-based analysis of schedule data
- Displays distribution statistics and patterns

## Development Notes

- Virtual environment (`venv/`) contains Flask and flask-cors dependencies
- React app uses Vite for fast HMR development
- ESLint configured for React code quality
- The `.gitignore` excludes data/, output/, and backup files per repository policy
- Start script handles port checking and process management