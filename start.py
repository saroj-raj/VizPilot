#!/usr/bin/env python3
"""
VizPilot Development Server Launcher
Starts both backend (FastAPI) and frontend (Next.js) servers for local development
"""

import subprocess
import sys
import os
import time
from pathlib import Path

# Color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_colored(message, color):
    print(f"{color}{message}{Colors.ENDC}")

def check_python_version():
    """Ensure Python 3.11+ is installed"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 11):
        print_colored("❌ Python 3.11+ is required!", Colors.FAIL)
        print_colored(f"   Current version: {version.major}.{version.minor}.{version.micro}", Colors.WARNING)
        sys.exit(1)
    print_colored(f"✅ Python {version.major}.{version.minor}.{version.micro} detected", Colors.OKGREEN)

def check_node():
    """Check if Node.js is installed"""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True, shell=True)
        if result.returncode == 0:
            print_colored(f"✅ Node.js {result.stdout.strip()} detected", Colors.OKGREEN)
            return True
    except FileNotFoundError:
        pass
    print_colored("❌ Node.js not found! Please install Node.js 18+", Colors.FAIL)
    return False

def check_npm():
    """Check if npm is installed"""
    try:
        result = subprocess.run(['npm', '--version'], capture_output=True, text=True, shell=True)
        if result.returncode == 0:
            print_colored(f"✅ npm {result.stdout.strip()} detected", Colors.OKGREEN)
            return True
    except FileNotFoundError:
        pass
    print_colored("❌ npm not found!", Colors.FAIL)
    return False

def start_backend():
    """Start FastAPI backend server"""
    backend_path = Path(__file__).parent / "elas-erp" / "backend"
    
    if not backend_path.exists():
        print_colored(f"❌ Backend directory not found: {backend_path}", Colors.FAIL)
        return None
    
    print_colored(f"\n🚀 Starting Backend Server...", Colors.OKCYAN)
    print_colored(f"   Location: {backend_path}", Colors.OKBLUE)
    print_colored(f"   URL: http://localhost:8000", Colors.OKBLUE)
    
    # Start uvicorn from backend directory
    backend_process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"],
        cwd=str(backend_path),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    
    return backend_process

def start_frontend():
    """Start Next.js frontend server"""
    frontend_path = Path(__file__).parent / "elas-erp" / "frontend"
    
    if not frontend_path.exists():
        print_colored(f"❌ Frontend directory not found: {frontend_path}", Colors.FAIL)
        return None
    
    print_colored(f"\n🚀 Starting Frontend Server...", Colors.OKCYAN)
    print_colored(f"   Location: {frontend_path}", Colors.OKBLUE)
    print_colored(f"   URL: http://localhost:4000", Colors.OKBLUE)
    
    # Check if node_modules exists
    node_modules = frontend_path / "node_modules"
    if not node_modules.exists():
        print_colored("\n📦 Installing frontend dependencies...", Colors.WARNING)
        install_process = subprocess.run(
            ["npm", "install"],
            cwd=str(frontend_path),
            capture_output=False,
            shell=True
        )
        if install_process.returncode != 0:
            print_colored("❌ Failed to install dependencies!", Colors.FAIL)
            return None
    
    # Start Next.js dev server
    frontend_process = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=str(frontend_path),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        shell=True
    )
    
    return frontend_process

def main():
    print_colored("\n" + "="*60, Colors.HEADER)
    print_colored("    🚀 VIZPILOT - Development Server", Colors.HEADER + Colors.BOLD)
    print_colored("="*60 + "\n", Colors.HEADER)
    
    # Check prerequisites
    print_colored("🔍 Checking prerequisites...\n", Colors.OKCYAN)
    check_python_version()
    
    if not check_node() or not check_npm():
        print_colored("\n❌ Missing required dependencies. Please install them first.", Colors.FAIL)
        sys.exit(1)
    
    print_colored("\n" + "="*60 + "\n", Colors.OKGREEN)
    
    # Start servers
    backend_process = start_backend()
    if not backend_process:
        sys.exit(1)
    
    time.sleep(2)  # Wait for backend to start
    
    frontend_process = start_frontend()
    if not frontend_process:
        backend_process.terminate()
        sys.exit(1)
    
    print_colored("\n" + "="*60, Colors.OKGREEN)
    print_colored("    ✅ SERVERS RUNNING!", Colors.OKGREEN + Colors.BOLD)
    print_colored("="*60, Colors.OKGREEN)
    print_colored("\n📍 URLs:", Colors.OKCYAN)
    print_colored("   🌐 Frontend: http://localhost:4000", Colors.OKBLUE)
    print_colored("   🔧 Backend:  http://localhost:8000", Colors.OKBLUE)
    print_colored("   📚 API Docs: http://localhost:8000/docs", Colors.OKBLUE)
    print_colored("\n⚠️  Press Ctrl+C to stop both servers\n", Colors.WARNING)
    print_colored("="*60 + "\n", Colors.OKGREEN)
    
    try:
        # Monitor both processes
        while True:
            # Check if processes are still running
            if backend_process.poll() is not None:
                print_colored("\n❌ Backend server stopped!", Colors.FAIL)
                frontend_process.terminate()
                break
            
            if frontend_process.poll() is not None:
                print_colored("\n❌ Frontend server stopped!", Colors.FAIL)
                backend_process.terminate()
                break
            
            time.sleep(1)
    
    except KeyboardInterrupt:
        print_colored("\n\n🛑 Shutting down servers...", Colors.WARNING)
        backend_process.terminate()
        frontend_process.terminate()
        
        # Wait for processes to terminate
        backend_process.wait(timeout=5)
        frontend_process.wait(timeout=5)
        
        print_colored("✅ Servers stopped successfully!", Colors.OKGREEN)
        print_colored("👋 Goodbye!\n", Colors.OKCYAN)

if __name__ == "__main__":
    main()
