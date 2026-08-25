import os

from dotenv import load_dotenv

from src.app import create_app

load_dotenv()
app = create_app()

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "3000"))
    uvicorn.run("src.main:app", host="0.0.0.0", port=port, reload=True)
