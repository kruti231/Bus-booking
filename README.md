Bus Booking System

***1.Defined Features
  User can view available buses and routes.
  User can book seats on a selected bus.
  Backend API for managing buses, bookings, and users.
  Prediction API to estimate the probability (%) of successful booking based on demand and other factors.

***Test Cases
  Booking a seat on an available bus (should succeed).
  Booking a seat on a full bus (should fail).
  Fetching available buses (should return correct list).
  Prediction API returns a probability between 0 and 100.

***2. Source Code
  main.py: FastAPI backend with endpoints for buses, bookings, and prediction.
  requirements.txt: Lists dependencies (e.g., fastapi, uvicorn, scikit-learn, pandas).
  frontend: Contains index.html, app.js, and style.css for the web interface.


***3. PREDICTION_APPROACH.md
  Prediction Logic
    Uses a simple logistic regression model to predict booking probability.
    Features: time of day, day of week, bus occupancy, route popularity.
  Model Choice
    Logistic Regression (interpretable, suitable for binary outcomes).
  Mock Dataset
    Simulated data with columns: time_of_day, day_of_week, occupancy_rate, route_popularity, booking_success.
  Training Methodology
    Train/test split (80/20).
    Model trained on mock data using scikit-learn.
    Evaluate with accuracy and ROC-AUC.
  Booking Probability Output (%)
    API returns a probability (0-100%) indicating the likelihood of a successful booking for given input parameters.
