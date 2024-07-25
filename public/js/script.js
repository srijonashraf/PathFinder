const socket = io();

// Check if browser supports geolocation
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      console.error("Something went wrong: ", error.message);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 2000,
    }
  );
}

let map = L.map("map").setView([0, 0], 100);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}", {
  foo: "bar",
}).addTo(map);

const markers = {};

socket.on("receive-location", (data) => {
  const { id, latitude, longitude } = data;
  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
    console.log("Old Marker Updated:", markers);
  } else {
    markers[id] = L.marker([latitude, longitude]).addTo(map);
    console.log("New Marker Created", markers);
  }
});

socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
