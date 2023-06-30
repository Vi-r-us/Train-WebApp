// Set the API endpoint and train number
const apiEndPoint = "https://calm-puce-drill-cape.cyclic.app/"
const trainNo = "47209"
let data = {} 

// Get references to input elements
const trainNameInput = document.getElementById("train-name-input")
const fromStationInput = document.getElementById("from-station-input")
const toStationInput = document.getElementById("to-station-input")
const trainContainer = document.getElementById("train-seats");
const noOfSeats = document.getElementById("available-seats");
const animationContainer = document.querySelector(".animation-container");

// Fetch train data from the API
async function getTrain(bookedSeatsMap) {
    // Fetch train data from the API
    const response = await fetch(apiEndPoint + "train/" + trainNo);
    const trainResponse = await response.json();

    // Update the data variable with the fetched train data
    data = trainResponse.train;

    // Render the seats on the UI with the provided bookedSeatsMap
    renderSeats(bookedSeatsMap);
}

// Render the train seats on the UI
function renderSeats(bookedSeatsMap) {
    // Set train details in booking-section
    trainNameInput.value = data.name;
    fromStationInput.value = data.source;
    toStationInput.value = data.destination;

    trainContainer.innerHTML = "";
    console.log(bookedSeatsMap);

    for (let i = 0; i < 12; i++) {
        const row = document.createElement("div");
        row.classList.add("row-label");

        for (let j = 0; j < 7; j++) {
            const seatNo = (i * 7 + j);
            if (seatNo > 79)    break;

            const seat = document.createElement("div");

            seat.setAttribute("id", "seatNo-" + (seatNo+1));
            seat.classList.add("seat");

            // Set the class based on seat availability
            if (bookedSeatsMap[seatNo+1] != undefined)
                seat.classList.add("userSeats");
            else
                seat.classList.add((data.seats[seatNo].isBooked) ? "booked" : "empty");

            seat.innerHTML = data.seats[seatNo].seatNo;
            row.appendChild(seat);
        }

        trainContainer.appendChild(row);
    }
}


// Get the number of available seats and book seats
function bookSeats() {
    if (noOfSeats.value < 0 || noOfSeats.value > 7) {
        alert("Enter a seat number between 1 and 7 inclusive to book");
        return;
    }

    bookSeatsByAPI(noOfSeats.value)
}

// Send a request to book seats through the API
async function bookSeatsByAPI(requestedSeats) {
    // Send a POST request to the API to book seats
    let response = await fetch(apiEndPoint + "book", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            trainNo : trainNo,
            numberOfSeats : requestedSeats
        })
    });

    // Parse the response as JSON
    response = await response.json();
    if (response.bookedSeats.length <= 0) {
        // Display an alert message if seats are not available
        alert("Seats are not available")
        return;
    } 

    // rendering the booked seats on UI
    const bookedSeats = response.bookedSeats;
    let map = {};
    for (let i = 0; i < bookedSeats.length; i++) {
        map[bookedSeats[i]] = 1;
    }

    renderLoadAnimation(map);
}

// Reset the seats to initial state
function resetSeats() {
    resetSeatsByAPI();
}

// Send a request to reset seats through the API
async function resetSeatsByAPI() {
    const response = await fetch(apiEndPoint + "reset/" + trainNo);
    renderLoadAnimation({});
}

// Display a loading animation while fetching or resetting data
function renderLoadAnimation(map) {
    // Display the loading animation
    animationContainer.style.display = "flex";

     // Delay the execution of the following code by 2000 milliseconds (2 seconds)
    setTimeout(function clickBody() {
        // Hide the loading animation
        animationContainer.style.display = "none";
        // Fetch train data and render seats on the UI
        getTrain(map);
    }, 1000);
}

// Initialize the loading animation with an empty map
renderLoadAnimation({});