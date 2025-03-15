const scriptURL = "https://script.google.com/macros/s/AKfycbyib14Bqwor_C8obsmnTshVB2lOE6ttM6MlL5SteMXNiX-l5Zt30FTpzNqZWt8LZK2B9Q/exec"; 
let latitude = null, longitude = null;

function requestLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
                document.getElementById("lokasi-status").innerText = `📍 Lokasi: ${latitude}, ${longitude}`;
                document.getElementById("lokasi-status").classList.add("success");
            },
            (error) => {
                showAlert("⚠️ Gagal mendapatkan lokasi: " + error.message);
                document.getElementById("lokasi-status").innerText = "⚠️ Lokasi tidak tersedia";
                document.getElementById("lokasi-status").classList.add("error");
            }
        );
    } else {
        showAlert("⚠️ Perangkat tidak mendukung GPS.");
    }
}

function submitForm() {
    const nama = document.getElementById("nama").value.trim();
    const status = document.getElementById("status").value;
    const regexNama = /^[A-Za-z\s]+$/;

    if (!nama.match(regexNama)) {
        showAlert("❌ Nama hanya boleh mengandung huruf dan spasi!");
        return;
    }
    if (!nama || !status) {
        showAlert("⚠️ Harap isi semua data!");
        return;
    }
    if (latitude === null || longitude === null) {
        showAlert("⚠️ Harap izinkan lokasi terlebih dahulu!");
        return;
    }

    fetch(scriptURL, {
        method: "POST",
        body: new URLSearchParams({ nama, status, latitude, longitude }),
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
    .then(response => response.text())
    .then(() => {
        showAlert("✅ Data berhasil dikirim ke JuaraMeta!");
        document.getElementById("nama").value = "";
        document.getElementById("status").value = "";
        loadData();
    })
    .catch(error => console.error("Error:", error));
}

function loadData() {
    fetch(scriptURL)
        .then(response => response.json())
        .then(data => {
            let tableContent = `<tr>
                <th>Waktu</th>
                <th>Nama</th>
                <th>Status</th>
                <th>Lokasi</th>
                <th>Aksi</th>
            </tr>`;

            let today = new Date().toISOString().split("T")[0];

            data.slice(1).forEach(row => {
                let timestamp = new Date(row[0]);
                let rowDate = timestamp.toISOString().split("T")[0];
                let options = { timeZone: "Asia/Jakarta", hour12: false, 
                    year: "numeric", month: "2-digit", day: "2-digit", 
                    hour: "2-digit", minute: "2-digit", second: "2-digit" 
                };
                let localTime = new Intl.DateTimeFormat("id-ID", options).format(timestamp);

                if (rowDate === today) {
                    tableContent += `<tr>
                        <td>${localTime}</td>
                        <td>${row[1]}</td>
                        <td>${row[2]}</td>
                        <td>📍 ${row[3]}, ${row[4]}</td>
                        <td><button class="btn-map" onclick="openMap(${row[3]}, ${row[4]})">Lihat Lokasi</button></td>
                    </tr>`;
                }
            });
            document.getElementById("dataTable").innerHTML = tableContent;
        })
        .catch(error => console.error("Error:", error));
}

function openMap(lat, lon) {
    window.open(`https://www.google.com/maps?q=${lat},${lon}`, "_blank");
}

// Fungsi Modal Kustom
function showAlert(message) {
    document.getElementById("alertMessage").innerText = message;
    document.getElementById("customAlert").style.display = "block";
}

function closeAlert() {
    document.getElementById("customAlert").style.display = "none";
}

window.onload = function() {
    loadData();
};
