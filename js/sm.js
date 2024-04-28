// const url = "http://localhost:8080/railboost_backend_war_exploded/journey";
const endpoint = "journey";


async function createJourneys() {
    let param = {
        date: new Date().toLocaleDateString("en-US", {year:"numeric", month:"2-digit", day:"2-digit"})
    }
    // Get the journeys from the backend
    let urlQuery = endpoint+`?json=${encodeURIComponent(JSON.stringify(param))}`;

    try {
        let data = await customFetch(urlQuery, {});
        
        console.log(data);
        // Create a table row for each journey
        if (Object.keys(data)){
            data.forEach(journey => {
                let row = document.getElementById("schedule_table").insertRow(-1);
                row.insertCell(0).innerHTML = journey.scheduleId;
                row.insertCell(1).innerHTML = journey.schedule.trainId;
                row.insertCell(2).innerHTML = journey.schedule.startStationName;
                row.insertCell(3).innerHTML = journey.schedule.endStationName;
                row.insertCell(4).innerHTML = journey.schedule.speed;
                row.insertCell(5).innerHTML = `<button class="view-button" onclick="createJourney('${journey.scheduleId}')">
                Update <i class="fa-solid fa-pen-to-square"></i></button>
                `;
            });
        }           
    } catch(error) {
        if (error=="login-redirected")
            localStorage.setItem("last_url", window.location.pathname);
    }
}



async function createJourney(id) {
    console.log("createJourney CALLED");
    let param = {
        date: new Date().toLocaleDateString("en-US", {year:"numeric", month:"2-digit", day:"2-digit"}),
        scheduleId: id
        // scheduleId: 8710
    }

    let urlQuery = endpoint+`?json=${encodeURIComponent(JSON.stringify(param))}`;
    
    try {
        let data = await customFetch(urlQuery, {})
        console.log(data)

        clearTable();
        
        // Create a table row for each journey
        if (Object.keys(data)){

                document.getElementById('sstation').textContent = data.schedule.startStationName;
            document.getElementById('dstation').textContent = data.schedule.endStationName;
            document.getElementById('tnum').textContent = data.schedule.scheduleId;
            document.getElementById('tspeed').textContent = data.schedule.speed;
        //     if (data.schedule.endDate!=null)
        //      document.getElementById("ends-on-date").innerHTML = data.schedule.endDate;
        //     else
        // document.getElementById("ends-on-date").innerHTML = "Continuous";


        document.querySelectorAll(".cat.day input[type='checkbox']").forEach(checkBox => {
            checkBox.checked = false;
            checkBox.disabled = true;
        });

        data.schedule.days.forEach(day => {
            let prefix = day.day.substring(0,3).toLowerCase();
            console.log(prefix);
            document.getElementById(prefix).checked = true;
        });
            data.stations.forEach(js => {
                
                let arrivalButton = document.createElement("button");
                arrivalButton.classList.add("view-button");
                arrivalButton.innerHTML = "Arrived <i class='fa-solid fa-arrow-down'></i>";
                arrivalButton.onclick = function() {updateTime(js.scheduleId, js.station,js.stationName, "arrival");}
                
                let departureButton = document.createElement("button");
                departureButton.classList.add("view-button");
                departureButton.innerHTML = "Departured <i class='fa-solid fa-arrow-up'></i>";
                departureButton.onclick = function() {updateTime(js.scheduleId, js.station,js.stationName, "departure");}
                
                let row = document.getElementById("journey_table").insertRow(-1);
                row.setAttribute("id", js.station);
                
                row.insertCell(0).innerHTML = js.stationName;
                row.insertCell(1).innerHTML = new Date('', '', '', js.scheduledArrivalTime.split(":")[0], js.scheduledArrivalTime.split(":")[1], js.scheduledArrivalTime.split(":")[2]).toLocaleTimeString(navigator.language||navigator.languages[0], {hour12: false});
                row.insertCell(2).innerHTML = new Date('', '', '', js.scheduledDepartureTime.split(":")[0], js.scheduledDepartureTime.split(":")[1], js.scheduledDepartureTime.split(":")[2]).toLocaleTimeString(navigator.language||navigator.languages[0], {hour12: false});
                if (js.arrivalTime==null)
                    row.insertCell(3).appendChild(arrivalButton);
                else
                    row.insertCell(3).innerHTML = new Date('', '', '', js.arrivalTime.split(":")[0], js.arrivalTime.split(":")[1], js.arrivalTime.split(":")[2]).toLocaleTimeString(navigator.language||navigator.languages[0], {hour12: false});
                if (js.departureTime==null)
                    row.insertCell(4).appendChild(departureButton);
                else
                    row.insertCell(4).innerHTML = new Date('', '', '', js.departureTime.split(":")[0], js.departureTime.split(":")[1], js.departureTime.split(":")[2]).toLocaleTimeString(navigator.language||navigator.languages[0], {hour12: false});

            });
            let dialog = document.querySelector(".dialog-modal");
            dialog.showModal();
        }
    } catch(error) {
        if (error=="login-redirected")
            localStorage.setItem("last_url", window.location.pathname);
    }       
}
function clearTable() {
    let table = document.getElementById("journey_table");
    while (table.rows.length > 0) { // Remove all rows
        table.deleteRow(0);
    }
}


async function updateTime(scheduleId, station,stationName, timeType) {
    let body = {
        scheduleId: scheduleId,
        station: station
    }

    let time = new Date().toLocaleTimeString(navigator.language||navigator.languages[0], {hour12: false});
    if(timeType == "arrival")
        body.arrivalTime = time;
    else
        body.departureTime = time;

    const params = {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
        method: "PUT"
    };

    console.log(params);

    try {
        let data = await customFetch(endpoint, params);
        console.log(data.status);
        if (data.status == 200) {
            if (timeType == "arrival")
                document.getElementById(station).cells[3].innerHTML = time;
            else if (timeType == "departure")
                document.getElementById(station).cells[4].innerHTML = time;
        } else if (data.status == 403) {
            // close existing dialog

            let dialog = document.querySelector(".dialog-modal");
            dialog.close();

            // view the sweet alert on top of dialog modal

            
            // Using SweetAlert for displaying error message
            Swal.fire({
                icon: 'error',
                title: 'Permission Denied',
                text: `You don't have permission to update station: ${stationName}`,
            });
        }
    } catch(error) {
        if (error == "login-redirected") {
            localStorage.setItem("last_url", window.location.pathname);
        }
    }
}




