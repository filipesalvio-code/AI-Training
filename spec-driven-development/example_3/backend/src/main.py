from dotenv import load_dotenv

from src.app import create_app
from src.config.environment import load_environment

load_dotenv()
environment = load_environment()
app = create_app(environment)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("src.main:app", host="0.0.0.0", port=environment.port, reload=True)
