const API = "http://127.0.0.1:8000";

let selectedSeats = [];
let tempBookingId = "";
let finalBookingId = "";

function show(id){
    document.querySelectorAll(".card").forEach(d => d.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
}

/* SEARCH */
function validateAndSearch(){

    const from = document.getElementById("from").value.trim();
    const to = document.getElementById("to").value.trim();
    const date = document.getElementById("date").value;

    const error = document.getElementById("searchError");

    if(from === "" || to === "" || date === ""){
        error.innerText = "Please fill all fields before searching.";
        return;
    }

    if(from.toLowerCase() !== "ahmedabad" || to.toLowerCase() !== "mumbai"){
        error.innerText = "Only Ahmedabad to Mumbai route is available.";
        return;
    }

    error.innerText = "";
    loadSeats();
}

/* LOAD SEATS */
async function loadSeats(){
    try{
        const res = await fetch(`${API}/seats`);
        const data = await res.json();

        const div = document.getElementById("seatContainer");
        div.innerHTML = "";
        selectedSeats = [];

        for(let seat in data){
            const btn = document.createElement("button");
            btn.innerText = seat;
            btn.className = "seat " + data[seat];

            if(data[seat] === "available"){
                btn.onclick = () => toggleSeat(seat, btn);
            }

            div.appendChild(btn);
        }

        show("seats");

    }catch(err){
        alert("Backend not running!");
    }
}

/* SELECT SEAT */
function toggleSeat(seat, btn){

    if(selectedSeats.includes(seat)){
        selectedSeats = selectedSeats.filter(s => s !== seat);
        btn.classList.remove("selected");
    }else{
        selectedSeats.push(seat);
        btn.classList.add("selected");
    }
}

/* BOOK SEATS */
async function bookSeats(){

    if(selectedSeats.length === 0){
        alert("Please select at least one seat");
        return;
    }

    const res = await fetch(`${API}/book-seat`,{
        method:"POST",
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({seats:selectedSeats})
    });

    const data = await res.json();

    if(data.booking_id){
        tempBookingId = data.booking_id;
        show("meal");
    }else{
        alert("Seat booking failed");
    }
}

/* BOOK MEAL */
async function bookMeal(){

    const mealType = document.getElementById("mealType").value;
    const qty = document.getElementById("mealQty").value;

    if(qty <= 0){
        alert("Meal quantity must be at least 1");
        return;
    }

    await fetch(`${API}/book-meal`,{
        method:"POST",
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
            booking_id: tempBookingId,
            meal_type: mealType,
            quantity: qty
        })
    });

    show("passenger");
}

/* CONFIRM BOOKING */
async function confirmBooking(){

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();

    if(name === "" || phone === ""){
        alert("Please enter passenger details");
        return;
    }

    const res = await fetch(`${API}/confirm-booking`,{
        method:"POST",
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
            booking_id: tempBookingId,
            name: name,
            phone: phone
        })
    });

    const data = await res.json();

    if(data.final_booking_id){
        finalBookingId = data.final_booking_id;
        document.getElementById("finalId").innerText =
            "Booking ID: " + finalBookingId;
        show("confirm");
    }else{
        alert("Booking failed");
    }
}

/* CANCEL FLOW */
function showCancel(){
    show("cancel");
}

async function cancelBooking(){

    const id = document.getElementById("cancelId").value.trim();

    if(id === ""){
        alert("Please enter booking ID");
        return;
    }

    const res = await fetch(`${API}/cancel-booking`,{
        method:"POST",
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({booking_id:id})
    });

    if(res.ok){
        alert("Booking Cancelled Successfully");
        location.reload();
    }else{
        alert("Invalid Booking ID");
    }
}
