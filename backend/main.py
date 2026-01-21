from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import random

app = FastAPI(title="Sleeper Bus Booking System")

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------ DATA ------------------ #

SEATS = {
    "U1": "booked", "U2": "booked", "U3": "available", "U4": "available",
    "L1": "available", "L2": "available", "L3": "booked", "L4": "available"
}

TEMP_BOOKINGS: Dict[str, dict] = {}
FINAL_BOOKINGS: Dict[str, dict] = {}

# ------------------ MODELS ------------------ #

class SeatRequest(BaseModel):
    seats: List[str]

class MealRequest(BaseModel):
    booking_id: str
    meal_type: str
    quantity: int

class ConfirmRequest(BaseModel):
    booking_id: str
    name: str
    phone: str

class CancelRequest(BaseModel):
    booking_id: str

# ------------------ APIs ------------------ #

@app.get("/seats")
def get_seats():
    return SEATS


@app.post("/book-seat")
def book_seat(req: SeatRequest):
    for s in req.seats:
        if SEATS.get(s) != "available":
            raise HTTPException(400, f"{s} not available")

    booking_id = f"TEMP{random.randint(1000,9999)}"

    for s in req.seats:
        SEATS[s] = "locked"

    TEMP_BOOKINGS[booking_id] = {"seats": req.seats, "meal": None}

    return {"booking_id": booking_id}


@app.post("/book-meal")
def book_meal(req: MealRequest):
    if req.booking_id not in TEMP_BOOKINGS:
        raise HTTPException(404, "Invalid booking")

    TEMP_BOOKINGS[req.booking_id]["meal"] = {
        "type": req.meal_type,
        "qty": req.quantity
    }

    return {"message": "Meal added"}


@app.post("/confirm-booking")
def confirm_booking(req: ConfirmRequest):
    if req.booking_id not in TEMP_BOOKINGS:
        raise HTTPException(404, "Invalid booking")

    final_id = f"BUS{random.randint(10000,99999)}"
    temp = TEMP_BOOKINGS[req.booking_id]

    for s in temp["seats"]:
        SEATS[s] = "booked"

    FINAL_BOOKINGS[final_id] = {
        "name": req.name,
        "phone": req.phone,
        "seats": temp["seats"],
        "meal": temp["meal"]
    }

    del TEMP_BOOKINGS[req.booking_id]

    return {"final_booking_id": final_id}


@app.post("/cancel-booking")
def cancel_booking(req: CancelRequest):
    if req.booking_id not in FINAL_BOOKINGS:
        raise HTTPException(404, "Invalid booking id")

    for s in FINAL_BOOKINGS[req.booking_id]["seats"]:
        SEATS[s] = "available"

    del FINAL_BOOKINGS[req.booking_id]

    return {"message": "Booking cancelled"}


# ---------- MOCK ML PREDICTION ---------- #

@app.get("/predict-confirmation")
def predict(time_before: float, seats: int, weekend: int, meal: int):

    score = (
        0.4 * meal +
        0.3 * weekend +
        0.2 * (1 / seats) +
        0.1 * (1 / time_before)
    )

    probability = min(round(score * 100, 2), 95)

    return {"confirmation_probability": f"{probability}%"}
