# Elas-ERP

A modern ERP system built with FastAPI backend and Next.js frontend.

## Overview

Elas-ERP is a full-stack ERP application featuring:
- **Backend**: FastAPI (Python) REST API
- **Frontend**: Next.js 14 with TypeScript, React 18, and Tailwind CSS
- **Database**: PostgreSQL
- **Deployment**: Docker & Docker Compose support

## Quick Start

### Prerequisites

- **Node.js**: v20 or higher (v22.20.0 recommended)
- **npm**: v10 or higher
- **Python**: 3.11 or higher
- **Docker Desktop**: For containerized deployment (optional)

### Frontend-First Setup (Recommended for Development)

This approach runs the frontend locally for faster development and better debugging:

1. **Install Node.js dependencies**:
   ```powershell
   cd frontend
   npm install
   ```

2. **Start the frontend**:
   ```powershell
   npm run dev
   ```
   
   The frontend will be available at http://localhost:4000

3. **Start the backend** (choose one):
   
   **Option A - Docker (recommended)**:
   ```powershell
   docker compose up -d backend
   ```
   Backend API will be at http://localhost:8000
   
   **Option B - Local Python**:
   ```powershell
   cd backend
   python -m uvicorn app.main:app --reload --port 8000
   ```

### Docker Setup (Full Stack)

Run both frontend and backend in containers:

```powershell
docker compose up -d
```

- Frontend: http://localhost:4000
- Backend API: http://localhost:8000

Stop services:
```powershell
docker compose down
```

### Single Command Launcher

Run both frontend and backend with one command:

```powershell
python main.py
```

**Available flags**:
- `--backend-only` or `--no-frontend`: Start only backend (skip frontend)
- `--port <PORT>`: Custom port for frontend (default: 4000)

**Environment variables**:
- `WEB_PORT`: Frontend port (default: 4000)
- `LAUNCHER_BACKEND_ONLY=1`: Skip frontend startup
- `LAUNCHER_SKIP_FRONTEND_PROMPT=1`: Auto-skip frontend if npm missing

## Port Configuration

**Default ports**:
- Frontend: **4000** (changed from 3000 due to Windows port exclusions)
- Backend: **8000**

**Windows users**: Ports 2953-3052 are often reserved by Windows. If you encounter port conflicts, use port 4000 or higher.

## Troubleshooting

### npm not recognized / npm command not found

**Symptoms**: `npm : The term 'npm' is not recognized as the name of a cmdlet...`

**Cause**: Node.js is installed but not in your system PATH, or installed via NVM for Windows without activation.

**Solutions**:

1. **If using NVM for Windows** (check `nvm version`):
   ```powershell
   nvm use 22.20.0
   # Or install and use latest LTS
   nvm install lts
   nvm use lts
   ```

2. **Temporary PATH fix** (current PowerShell session only):
   ```powershell
   # Find your Node installation
   Get-Command node.exe -ErrorAction SilentlyContinue
   
   # If Node is at C:\Users\YourName\AppData\Local\nvm\v22.20.0:
   $env:Path = "C:\Users\YourName\AppData\Local\nvm\v22.20.0;" + $env:Path
   
   # Verify
   npm -v
   ```

3. **Permanent PATH fix**:
   - Open **System Properties** → **Environment Variables**
   - Under **User variables**, edit **Path**
   - Add your Node.js installation directory (e.g., `C:\Program Files\nodejs` or `C:\Users\YourName\AppData\Local\nvm\v22.20.0`)
   - Restart PowerShell/VS Code

4. **Fresh Node.js installation**:
   - Download from https://nodejs.org/
   - Run installer with "Add to PATH" option checked
   - Restart terminal

**Testing your fix**:
```powershell
node -v   # Should show v22.20.0 or similar
npm -v    # Should show v10.9.3 or similar
```

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::4000`

**Solutions**:

1. **Stop conflicting service**:
   ```powershell
   # Stop Docker frontend container
   docker stop elas-erp-frontend
   
   # Or stop all Docker services
   docker compose down
   ```

2. **Use different port**:
   ```powershell
   # In frontend/
   npm run dev -- -p 4001
   
   # Or with main.py
   python main.py --port 4001
   ```

3. **Find process using port**:
   ```powershell
   netstat -ano | findstr :4000
   # Kill process by PID
   taskkill /F /PID <PID>
   ```

### Python Virtual Environment Issues

**Error**: `ModuleNotFoundError: No module named 'backend'`

**Solution**: The virtual environment is located at `../Elas-ERP/.venv` (parent directory):

```powershell
# Activate venv
& "..\Elas-ERP\.venv\Scripts\Activate.ps1"

# Install backend dependencies
cd backend
pip install -r requirements.txt
```

### Docker Build Failures

**Error**: `failed to solve: failed to compute cache key`

**Solution**: Rebuild without cache:
```powershell
docker compose build --no-cache
docker compose up -d
```

## Development Workflow

### Frontend Development

```powershell
cd frontend
npm install          # First time only
npm run dev          # Start dev server on port 4000
npm run build        # Production build
npm run start        # Production server
npm run lint         # Check code style
```

### Backend Development

**Local development**:
```powershell
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

**With Docker**:
```powershell
docker compose up -d backend
docker compose logs -f backend  # View logs
docker compose restart backend  # After code changes
```

### Running Tests

```powershell
# Backend tests (from backend/)
pytest

# Frontend tests (from frontend/)
npm test
```

## Project Structure

```
elas-erp/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app entry point
│   │   ├── api/              # API routes
│   │   ├── models/           # Database models
│   │   └── schemas/          # Pydantic schemas
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── dashboard/[role]/ # Role-based dashboards
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/           # React components
│   ├── lib/                  # Utilities
│   ├── public/               # Static assets
│   ├── package.json
│   └── next.config.mjs
├── docker-compose.yml
├── main.py                   # Single-command launcher
└── README.md
```

## Technology Stack

### Backend
- **Framework**: FastAPI 0.115.12
- **Python**: 3.11+
- **ORM**: SQLAlchemy (likely)
- **Database**: PostgreSQL
- **Server**: Uvicorn

### Frontend
- **Framework**: Next.js 14.2.33
- **React**: 18.3.1
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.1
- **UI Components**: Radix UI, Lucide Icons
- **Forms**: React Hook Form + Zod validation
- **State**: React Context/Hooks

## Environment Variables

Create `.env` files for configuration:

**backend/.env**:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/elas_erp
SECRET_KEY=your-secret-key
DEBUG=True
```

**frontend/.env.local**:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Docker Configuration

**docker-compose.yml** runs:
- `backend`: FastAPI on port 8000
- `frontend`: Next.js on port 4000:3000 (host:container)
- `db`: PostgreSQL on port 5432

**Useful Docker commands**:
```powershell
docker compose up -d              # Start all services
docker compose down               # Stop all services
docker compose logs -f backend    # View backend logs
docker compose restart frontend   # Restart frontend
docker compose build --no-cache   # Rebuild from scratch
docker compose ps                 # List running containers
```

## API Documentation

Once the backend is running, access interactive API docs:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Submit a Pull Request

## License

[Add license information]

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing documentation in the `docs/` folder
- Review DOCKER_QUICKSTART.md for Docker-specific help

## Additional Documentation

- **DOCKER_QUICKSTART.md**: Docker setup guide
- **DOCKER_SETUP.md**: Detailed Docker configuration
- **NODEJS_INSTALLATION.md**: Node.js installation guide
- **QUICKSTART.md**: Quick start guide
- **DEPLOYMENT_STATUS.md**: Current deployment status
