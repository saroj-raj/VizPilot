# main.py — one-file launcher for backend + frontend + browser open
import os, sys, time, subprocess, signal, webbrowser, pathlib, shutil, socket
from urllib.request import urlopen
from urllib.error import URLError

# ---- Config ----
API_PORT = int(os.environ.get("APP_PORT", 8000))
WEB_PORT = int(os.environ.get("WEB_PORT", 4000))
API_HOST = "127.0.0.1"
WEB_URL  = f"http://localhost:{WEB_PORT}"
API_HEALTH = f"http://{API_HOST}:{API_PORT}/health"

def on_windows() -> bool:
    return os.name == "nt"

REPO_ROOT = pathlib.Path(__file__).parent.resolve()
BACKEND   = REPO_ROOT / "backend"
FRONTEND  = REPO_ROOT / "frontend"
PARENT_DIR = REPO_ROOT.parent
VENV_PYTHON = PARENT_DIR / ".venv" / "Scripts" / "python.exe" if on_windows() else PARENT_DIR / ".venv" / "bin" / "python"

# Optional: ensure frontend points at backend if not set
ENV_LOCAL = FRONTEND / ".env.local"
ENV_LINE  = f"NEXT_PUBLIC_API_BASE=http://{API_HOST}:{API_PORT}\n"

def ensure_frontend_env():
    FRONTEND.mkdir(parents=True, exist_ok=True)
    if not ENV_LOCAL.exists():
        ENV_LOCAL.write_text(ENV_LINE, encoding="utf-8")
    else:
        txt = ENV_LOCAL.read_text(encoding="utf-8")
        if "NEXT_PUBLIC_API_BASE" not in txt:
            ENV_LOCAL.write_text(txt.rstrip() + "\n" + ENV_LINE, encoding="utf-8")

def run(cmd, cwd=None, env=None):
    creationflags = 0
    if on_windows():
        creationflags = subprocess.CREATE_NEW_PROCESS_GROUP
    return subprocess.Popen(
        cmd,
        cwd=str(cwd) if cwd else None,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        creationflags=creationflags,
        text=True
    )

def wait_http(url, timeout=60, name="service"):
    start = time.time()
    while time.time() - start < timeout:
        try:
            with urlopen(url, timeout=2) as r:
                if 200 <= r.status < 500:  # 200 OK expected
                    return True
        except (URLError, TimeoutError, socket.timeout):
            pass
        time.sleep(1)
    print(f"[launcher] Timed out waiting for {name} at {url}")
    return False

def stream_logs(proc, prefix):
    # non-blocking-ish line reader
    if proc.stdout:
        lines = []
        try:
            while proc.stdout.peek():
                lines.append(proc.stdout.readline().rstrip())
        except Exception:
            pass
        for ln in lines[-5:]:  # last few lines
            print(f"[{prefix}] {ln}")

def ensure_python_deps():
    # Warn if FastAPI/uvicorn aren’t present in current interpreter
    missing = []
    for mod in ("fastapi", "uvicorn"):
        try:
            __import__(mod)
        except Exception:
            missing.append(mod)
    if missing:
        print(f"[launcher] Missing Python deps: {', '.join(missing)}")
        print("[launcher] Activate your venv and install:")
        print("  cd .. && python -m venv .venv && .\\.venv\\Scripts\\Activate.ps1  (PowerShell)")
        print("  cd elas-erp && pip install -r backend/requirements.txt")
        sys.exit(1)

def main():
    os.chdir(REPO_ROOT)

    # Flags/env to control frontend behavior
    args = set(sys.argv[1:])
    backend_only = (
        "--backend-only" in args or "--no-frontend" in args or
        os.environ.get("LAUNCHER_BACKEND_ONLY") == "1" or
        os.environ.get("LAUNCHER_SKIP_FRONTEND_PROMPT") == "1"
    )

    # 1) sanity checks
    if not (BACKEND / "app" / "main.py").exists():
        print("[launcher] backend/app/main.py not found.")
        sys.exit(1)
    if not (FRONTEND / "package.json").exists():
        print("[launcher] frontend/package.json not found.")
        sys.exit(1)

    ensure_frontend_env()

    # Check if venv exists
    if not VENV_PYTHON.exists():
        print(f"[launcher] Virtual environment not found at {VENV_PYTHON}")
        print("[launcher] Create it with:")
        print(f"  cd .. && python -m venv .venv && .\\.venv\\Scripts\\Activate.ps1")
        print("  cd elas-erp && pip install -r backend/requirements.txt")
        sys.exit(1)

    # 2) check if npm available for frontend
    # On Windows, npm might be npm.cmd; try harder to find it
    npm_exe = shutil.which("npm") or shutil.which("npm.cmd")
    skip_frontend = backend_only or not bool(npm_exe)
    if not npm_exe and not backend_only:
        print("[launcher] WARNING: 'npm' not found in PATH.")
        print("[launcher] Backend will start; run frontend separately:")
        print("[launcher]   cd frontend && npm install && npm run dev -- -p 4000")
        # do not block on input; continue automatically

    # 3) start backend (uses venv python and module path so no PYTHONPATH hacks)
    uvicorn_cmd = [
        str(VENV_PYTHON), "-m", "uvicorn",
        "backend.app.main:app",
        "--host", API_HOST, "--port", str(API_PORT), "--reload"
    ]
    print(f"[launcher] starting backend: {' '.join(uvicorn_cmd)}")
    api_proc = run(uvicorn_cmd, cwd=REPO_ROOT)

    # 4) wait for API health
    print(f"[launcher] waiting for API {API_HEALTH} ...")
    if not wait_http(API_HEALTH, timeout=60, name="API"):
        stream_logs(api_proc, "api")
        cleanup([api_proc], [])
        sys.exit(1)

    # 5) start frontend (if npm available)
    web_proc = None
    if not skip_frontend:
        print(f"[launcher] starting frontend at {WEB_URL} ...")
        web_proc = run([npm_exe, "run", "dev", "--", "-p", str(WEB_PORT)], cwd=FRONTEND)
        # 6) wait for web to respond and open browser
        wait_http(WEB_URL, timeout=60, name="web")
        print(f"[launcher] opening {WEB_URL}")
        try:
            webbrowser.open(WEB_URL, new=2)
        except Exception:
            pass
    else:
        print(f"[launcher] Skipping frontend. Start it manually in another terminal.")
        print(f"[launcher] Backend API running at http://{API_HOST}:{API_PORT}")
        print(f"[launcher] API health: {API_HEALTH}")

    print("[launcher] Running. Press Ctrl+C to stop.")
    try:
        # tail a little output every few seconds
        while True:
            time.sleep(5)
            stream_logs(api_proc, "api")
            if web_proc:
                stream_logs(web_proc, "web")
            if api_proc.poll() is not None:
                print("[launcher] backend exited — stopping.")
                break
            if web_proc and web_proc.poll() is not None:
                print("[launcher] frontend exited — stopping.")
                break
    except KeyboardInterrupt:
        print("\n[launcher] Ctrl+C received. Stopping...")
    finally:
        procs_to_cleanup = [api_proc]
        if web_proc:
            procs_to_cleanup.append(web_proc)
        cleanup(procs_to_cleanup, [])

def cleanup(procs, extra_pids):
    for p in procs:
        if p and p.poll() is None:
            try:
                if on_windows():
                    p.send_signal(signal.CTRL_BREAK_EVENT)
                else:
                    p.terminate()
            except Exception:
                pass
    time.sleep(1.0)
    for p in procs:
        if p and p.poll() is None:
            try:
                p.kill()
            except Exception:
                pass

if __name__ == "__main__":
    main()
