import os
import sys
import uvicorn

if __name__ == "__main__":
    app_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(app_dir)
    sys.path.insert(0, app_dir)
    print("Starting PortPilot AI backend on http://127.0.0.1:8000...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
