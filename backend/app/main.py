from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
#from app.location.models import Location
#from app.waitlist.models import WaitlistEntry
from app.waitlist.routes import router as router_waitlist
from app.location.routes import router as router_location

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Mesa247 demo API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router_waitlist)
app.include_router(router_location)


@app.get("/health")
def health():
    return {"status": "ok"}