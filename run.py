import os
import subprocess
import sys
import webbrowser
import platform
import time

def run_command(command, cwd=None, shell=True):
    """Runs a shell command and checks for errors."""
    try:
        print(f"🔹 Running: {command}")
        subprocess.check_call(command, cwd=cwd, shell=shell)
    except subprocess.CalledProcessError as e:
        print(f"❌ Error running command: {command}")
        sys.exit(1)

def check_requirements():
    """Checks if Python and Node.js are available."""
    print("🔍 Checking system requirements...")
    try:
        # Use sys.executable to check the current python version
        subprocess.check_call([sys.executable, "--version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print(f"✅ Python found: {sys.executable}")
    except:
        print("❌ Python check failed!")
        sys.exit(1)

    try:
        subprocess.check_call(["npm", "--version"], shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print("✅ Node.js found.")
    except:
        print("❌ Node.js not found! Please install Node.js 16+")
        sys.exit(1)

def setup_backend():
    """Installs backend dependencies."""
    print("\n📦 Setting up Backend...")
    backend_dir = os.path.join(os.getcwd(), "backend")
    
    if not os.path.exists(backend_dir):
        print("❌ Backend directory not found!")
        sys.exit(1)

    # Upgrade pip
    run_command([sys.executable, "-m", "pip", "install", "--upgrade", "pip"])
    
    # Install requirements
    requirements_file = os.path.join(backend_dir, "requirements.txt")
    if os.path.exists(requirements_file):
        run_command([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], cwd=backend_dir, shell=False)
    else:
        print("⚠️ requirements.txt not found in backend.")

def setup_frontend():
    """Installs frontend dependencies and builds the project."""
    print("\n🎨 Setting up Frontend...")
    frontend_dir = os.path.join(os.getcwd(), "frontend")

    if not os.path.exists(frontend_dir):
        print("❌ Frontend directory not found!")
        sys.exit(1)

    # Install dependencies
    run_command("npm install", cwd=frontend_dir)

    # Build the frontend
    print("\n🔨 Building Frontend...")
    run_command("npm run build", cwd=frontend_dir)

def run_application():
    """Starts the Flask application."""
    print("\n🚀 Starting Nexus AI...")
    backend_dir = os.path.join(os.getcwd(), "backend")
    
    # Open browser after a slight delay
    def open_browser():
        time.sleep(3)
        webbrowser.open("http://localhost:5000")
    
    import threading
    threading.Thread(target=open_browser).start()

    # Run Flask app
    run_command([sys.executable, "app.py"], cwd=backend_dir, shell=False)

if __name__ == "__main__":
    print("=======================================")
    print("   Nexus AI - Setup & Run Automation   ")
    print("=======================================")
    
    check_requirements()
    setup_backend()
    setup_frontend()
    run_application()
