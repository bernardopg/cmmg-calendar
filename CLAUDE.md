# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚀 Project Status: Production Ready

Full-stack academic schedule converter with modern web interface, comprehensive documentation, and production-ready features.

## Project Overview

CMMG Calendar Analyzer is a bilingual (Portuguese) academic schedule converter that processes `QuadroHorarioAluno.json` files and exports to various calendar formats (CSV for Google Calendar, ICS for Thunderbird). The project consists of:

- **Python Flask API** (`api_server.py`) - Backend with file upload, analysis, and export endpoints
- **React TypeScript frontend** (`react-app/`) - Web interface for file upload and schedule analysis
- **CLI tool** (`main.py`) - Command-line interface for direct JSON-to-export conversion
- **Export utilities** (`exports.py`) - Shared logic for CSV/ICS generation

## Architecture

### Backend (Python)

- **Flask API** with CORS, rate limiting, Pydantic validation, and structured logging
- **Core endpoints**: `/analyze` (file analysis), `/export/csv`, `/export/ics`, `/health`
- **Data flow**: JSON upload → validation → extraction → analysis/export
- **Rate limiting**: 10 requests/minute for analysis, 5/minute for exports

### Frontend (React + TypeScript)

- **Vite build system** with TypeScript, Tailwind CSS, and Lucide icons
- **File upload interface** with drag-and-drop support
- **Statistics display** showing subjects, time slots, locations, weekly/monthly distribution
- **Export functionality** directly from the web interface

### Data Processing

- **Input format**: `{"data": {"SHorarioAluno": [...]}}`
- **Validation**: Pydantic models ensure data integrity
- **Export formats**: CSV (Google Calendar), ICS (Thunderbird/standard calendars)

## Development Commands

### Full Stack Development

```bash
# Start both API and React dev servers
./start_app.sh

# Manually start API only
./venv/bin/python api_server.py

# Manually start React dev server only
cd react-app && npm run dev
```

### Python Backend

```bash
# Install Python dependencies
pip install -r requirements.txt

# Run CLI converter
python main.py

# Test API endpoints
python test_export_endpoints.py
```

### React Frontend

```bash
cd react-app

# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Key Configuration

### Environment Variables (`.env`)

- `FLASK_DEBUG`: Enable Flask debug mode
- `SECRET_KEY`: Flask secret key
- `MAX_FILE_SIZE`: Maximum upload size in MB (default: 10)
- `PORT`: API server port (default: 5000)

### Default Ports

- **API**: <http://localhost:5000>
- **React**: <http://localhost:5173>

### File Structure

- **Input**: `data/QuadroHorarioAluno.json` (CLI mode)
- **Output**: `output/GoogleAgenda.csv`, `output/ThunderbirdAgenda.ics` (CLI mode)
- **Logs**: `api_server.log` (API mode)

## Testing & Quality

The project uses ESLint for frontend code quality. Run `npm run lint` in the `react-app/` directory to check TypeScript/React code standards.

API endpoints can be tested using the provided `test_export_endpoints.py` script.
