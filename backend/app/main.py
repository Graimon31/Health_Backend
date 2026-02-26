from fastapi import FastAPI

app = FastAPI(title="Health Backend API", docs_url="/api/docs", openapi_url="/api/openapi.json")


@app.get("/api/v1/health")
def health() -> dict[str, str]:
    return {"status": "OK"}
