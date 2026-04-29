from contextlib import asynccontextmanager

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import (
    auth,
    defaulters_route,
    feedback_route,
    lease,
    notifications_route,
    requests as issue_requests,
    resources,
    rules_route,
    transactions,
    users_route,
)
from app.config import REMINDER_HOUR_UTC
from app.services.reminder_jobs import run_due_reminders

scheduler = BackgroundScheduler()


@asynccontextmanager
async def lifespan(_: FastAPI):
    scheduler.add_job(
        run_due_reminders,
        CronTrigger(hour=REMINDER_HOUR_UTC, minute=0, timezone="UTC"),
        id="due_reminders",
        replace_existing=True,
    )
    scheduler.start()
    yield
    scheduler.shutdown(wait=False)


app = FastAPI(title="URMS API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(resources.router)
app.include_router(issue_requests.router)
app.include_router(transactions.router)
app.include_router(lease.router)
app.include_router(rules_route.router)
app.include_router(users_route.router)
app.include_router(defaulters_route.router)
app.include_router(notifications_route.router)
app.include_router(feedback_route.router)


@app.get("/health")
def health():
    return {"status": "ok"}
