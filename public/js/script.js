const socket = io();
let map = L.map("map").setView([0, 0], 5);
let initialLocationSet = false; // Flag to check if the initial location is set

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}", {
  foo: "bar",
}).addTo(map);

// Check if browser supports geolocation
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords;

      if (!initialLocationSet) {
        // Set the initial location
        // map.panTo({ lng: longitude, lat: latitude });
        map.setView([latitude, longitude], 15); // Zoom level 15 for closer view
        initialLocationSet = true;
      }

      socket.emit("send-location", { latitude, longitude, accuracy });
    },
    (error) => {
      console.error("Something went wrong: ", error.message);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000,
    }
  );
}

const markers = {};

socket.on("receive-location", (data) => {
  const { id, latitude, longitude, accuracy } = data;
  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
    L.circle([latitude, longitude], { radius: 200 }).addTo(map);
    console.log("Old Marker Updated:", markers);
  } else {
    markers[id] = L.marker([latitude, longitude]).addTo(map);
    L.circle([latitude, longitude], { radius: 200 }).addTo(map);
    console.log("New Marker Created", markers);
  }
});

socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
