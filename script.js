(function() {
  const container = document.getElementById('three-container');
  const bookingContent = document.getElementById('booking-content');
  let renderer, camera, scene, sphere;
  let isScrolling = false;
  let scrollDelta = 0;

  const SPHERE_RADIUS = 1;
  const MARGIN_RATIO = 0.14;
  const FOV = 50;

  const BOOKING_RESPONSE = {
    "message": "fetch all booking data By user Id",
    "success": true,
    "data": [
      {
        "_id": "690aff29d43f6e94032c2944",
        "passenger": [
          {
            "title": "Mr",
            "fName": "Amaan",
            "lName": "khan",
            "pType": "A",
            "gender": "M",
            "dob": "03-09-1999",
            "_id": "690aff29d43f6e94032c2945"
          }
        ],
        "refID": "API25110521283HZTZ130631",
        "userID": "690afedad43f6e94032c293d",
        "clientID": 280744768168,
        "flightID": 126201,
        "mobile": "9301405912",
        "email": "amaan001@gmail.com",
        "bookingStatus": "success",
        "tripType": "0",
        "serType": "1",
        "response": {
          "success": 1,
          "errorDesc": "",
          "bookingID": 1960371,
          "flights": {
            "Flights": {
              "Onward": [
                {
                  "flightID": "126201",
                  "depCode": "DEL",
                  "depCName": "New Delhi",
                  "depTer": "1B",
                  "depDate": "202511060030",
                  "flightNo": "8375",
                  "airCode": "6E",
                  "airName": "IndiGo",
                  "arrCode": "HYD",
                  "arrCName": "Hyderabad",
                  "arrTer": "1A",
                  "arrDate": "202511060250",
                  "duration": "140",
                  "layover": null,
                  "cabin": "E"
                }
              ],
              "bagCkin": "1 Pc||",
              "bagCbin": "7 Kg||",
              "refundable": "N",
              "durTotal": "140",
              "stops": "0"
            },
            "Fare": {
              "total": {
                "base": "5033",
                "tax": "481",
                "total": "5514",
                "inc": "640",
                "tds": "13",
                "netfare": "4874",
                "txnFees": "10",
                "agentMarkup": "0"
              }
            }
          },
          "ticket": {
            "Onward": {
              "passenger": [
                {
                  "paxID": "691655",
                  "title": "Mr",
                  "fName": "AMAAN",
                  "lName": "KHAN",
                  "pType": "adt",
                  "gender": "M",
                  "dob": "03-09-1999",
                  "pnr": "TEST85",
                  "ticketNo": "TEST85",
                  "mobile": "8839725353",
                  "email": "celestialtours.ct@gmail.com"
                }
              ]
            },
            "mobile": "8839725353",
            "email": "celestialtours.ct@gmail.com"
          },
          "Status": {
            "refID": "API25110521283HZTZ130631",
            "clientID": 280744768168,
            "status": "success"
          }
        },
        "createdAt": "2025-11-05T07:39:21.210Z",
        "updatedAt": "2025-11-05T07:39:21.210Z",
        "__v": 0
      }
    ]
  };

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  });

  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC"
  });

  function parseFlightDate(value) {
    if (typeof value !== "string" || value.length < 12) {
      return { dateText: "N/A", timeText: "N/A" };
    }

    const year = Number.parseInt(value.slice(0, 4), 10);
    const month = Number.parseInt(value.slice(4, 6), 10) - 1;
    const day = Number.parseInt(value.slice(6, 8), 10);
    const hour = Number.parseInt(value.slice(8, 10), 10);
    const minute = Number.parseInt(value.slice(10, 12), 10);

    if (
      Number.isNaN(year) ||
      Number.isNaN(month) ||
      Number.isNaN(day) ||
      Number.isNaN(hour) ||
      Number.isNaN(minute)
    ) {
      return { dateText: "N/A", timeText: "N/A" };
    }

    const date = new Date(Date.UTC(year, month, day, hour, minute));
    return {
      dateText: dateFormatter.format(date),
      timeText: timeFormatter.format(date)
    };
  }

  function createDateSection(label, dateText, timeText) {
    const section = document.createElement("section");

    const labelEl = document.createElement("span");
    labelEl.className = "label";
    labelEl.textContent = label;

    const dateEl = document.createElement("span");
    dateEl.className = "date";
    dateEl.textContent = dateText;

    const timeEl = document.createElement("span");
    timeEl.className = "time";
    timeEl.textContent = timeText;

    section.append(labelEl, dateEl, timeEl);
    return section;
  }

  function formatLocation(city, terminal) {
    if (!city && !terminal) {
      return null;
    }

    if (city && terminal) {
      return `${city} - Terminal ${terminal}`;
    }

    return city || `Terminal ${terminal}`;
  }

  function formatDuration(value) {
    const minutes = Number.parseInt(value, 10);
    if (!Number.isFinite(minutes) || minutes <= 0) {
      return null;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const parts = [];

    if (hours) {
      parts.push(`${hours}h`);
    }

    if (mins) {
      parts.push(`${mins}m`);
    }

    if (!parts.length) {
      parts.push("0m");
    }

    return parts.join(" ");
  }

  function createMetaItem(label, value) {
    if (!value) {
      return null;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "meta-item";

    const labelEl = document.createElement("span");
    labelEl.className = "label";
    labelEl.textContent = label;

    const valueEl = document.createElement("span");
    valueEl.textContent = value;

    wrapper.append(labelEl, valueEl);
    return wrapper;
  }

  function buildFlightCard(flight) {
    const card = document.createElement("article");
    card.className = "flight-card";
    card.setAttribute("role", "listitem");

    const route = document.createElement("div");
    route.className = "flight-route";

    const routePair = document.createElement("div");
    routePair.className = "route-pair";

    const depCode = document.createElement("span");
    depCode.className = "airport-code";
    depCode.textContent = (flight && flight.depCode) || "---";

    const arrow = document.createElement("span");
    arrow.className = "arrow";
    arrow.textContent = "->";

    const arrCode = document.createElement("span");
    arrCode.className = "airport-code";
    arrCode.textContent = (flight && flight.arrCode) || "---";

    routePair.append(depCode, arrow, arrCode);

    const airline = document.createElement("div");
    airline.className = "airline";

    const airlineName = document.createElement("strong");
    airlineName.textContent = (flight && flight.airName) || "N/A";
    airline.appendChild(airlineName);

    const airlineCode = [flight && flight.airCode, flight && flight.flightNo]
      .filter(Boolean)
      .join(" ");

    if (airlineCode) {
      const flightNo = document.createElement("span");
      flightNo.textContent = airlineCode;
      airline.appendChild(flightNo);
    }

    route.append(routePair, airline);

    const depDateTime = parseFlightDate(flight && flight.depDate);
    const arrDateTime = parseFlightDate(flight && flight.arrDate);

    const datetimeBlock = document.createElement("div");
    datetimeBlock.className = "datetime-block";
    datetimeBlock.append(
      createDateSection("Departure", depDateTime.dateText, depDateTime.timeText),
      createDateSection("Arrival", arrDateTime.dateText, arrDateTime.timeText)
    );

    card.append(route, datetimeBlock);

    const meta = document.createElement("div");
    meta.className = "meta";

    const fromMeta = createMetaItem(
      "From",
      formatLocation(flight && flight.depCName, flight && flight.depTer)
    );
    const toMeta = createMetaItem(
      "To",
      formatLocation(flight && flight.arrCName, flight && flight.arrTer)
    );
    const durationMeta = createMetaItem("Duration", formatDuration(flight && flight.duration));
    const cabinMeta = createMetaItem(
      "Cabin",
      flight && flight.cabin ? (flight.cabin === "E" ? "Economy" : flight.cabin) : null
    );

    [fromMeta, toMeta, durationMeta, cabinMeta].forEach(function(item) {
      if (item) {
        meta.appendChild(item);
      }
    });

    if (meta.childElementCount > 0) {
      card.appendChild(meta);
    }

    return card;
  }

  function renderBookingDetails(response) {
    if (!bookingContent) {
      return;
    }

    bookingContent.innerHTML = "";

    const bookings = Array.isArray(response && response.data) ? response.data : [];
    if (!bookings.length) {
      const empty = document.createElement("p");
      empty.textContent = "No booking data available.";
      bookingContent.appendChild(empty);
      return;
    }

    bookings.forEach(function(booking) {
      const onwardFlights =
        booking &&
        booking.response &&
        booking.response.flights &&
        booking.response.flights.Flights &&
        booking.response.flights.Flights.Onward;

      if (Array.isArray(onwardFlights)) {
        onwardFlights.forEach(function(flight) {
          bookingContent.appendChild(buildFlightCard(flight));
        });
      }
    });
  }

  renderBookingDetails(BOOKING_RESPONSE);

  function fitCameraToSphere(fov, aspect, sphereRadius, marginRatio) {
    const margin = 1 + marginRatio;
    const fovRad = fov * Math.PI / 180;
    const fitHeightDistance = margin * sphereRadius / Math.sin(fovRad / 2);
    const fitWidthDistance = margin * sphereRadius / Math.sin(Math.atan(Math.tan(fovRad / 2) * aspect));
    return Math.max(fitHeightDistance, fitWidthDistance);
  }

  function init(texture) {
    scene = new THREE.Scene();
    
    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(FOV, aspect, 0.1, 1000);
    const distance = fitCameraToSphere(FOV, aspect, SPHERE_RADIUS, MARGIN_RATIO);
    camera.position.set(0, 0, distance);

    const light1 = new THREE.DirectionalLight(0xffffff, 0.8);
    light1.position.set(1, 1, 2);
    scene.add(light1);

    const ambient = new THREE.AmbientLight(0x404080, 0.7);
    scene.add(ambient);

    const geometry = new THREE.SphereGeometry(SPHERE_RADIUS, 64, 64);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    sphere = new THREE.Mesh(geometry, material);

    sphere.rotation.y = -Math.PI * 3 / 4; // Initial rotation to adjust globe facing
    
    scene.add(sphere);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.domElement.style.filter = 'drop-shadow(0 0 30px rgba(0, 0, 0, 0.5))';
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', resize, false);

    animate();
  }

  function resize() {
    if (!renderer || !camera) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function animate() {
    requestAnimationFrame(animate);

    if (sphere) {
      sphere.rotation.y -= 0.0005; // Slow auto-rotation
      if (isScrolling) {
        sphere.rotation.y += scrollDelta;
        scrollDelta *= 0.9; // Slowly decay scroll effect
        if (Math.abs(scrollDelta) < 0.00001) {
          isScrolling = false;
        }
      }
    }

    renderer.render(scene, camera);
  }

  const loader = new THREE.TextureLoader();
  loader.load(
    "world-map.png",
    function(texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.center.set(0.5, 0.5);
      texture.offset.y = 0.2;
      init(texture);
    },
    undefined,
    function(err) {
      alert("Failed to load world map texture.");
    }
  );

  container.addEventListener('wheel', function(event) {
    event.preventDefault();

    const scrollStrength = 0.002; // smoother scroll speed
    scrollDelta += (event.deltaY > 0 ? 1 : -1) * scrollStrength;
    isScrolling = true;
  });
  // Variables to track touch
let isTouching = false;
let lastTouchX = 0;
let touchDeltaX = 0;

// Add these event listeners after "wheel" listener
container.addEventListener('touchstart', function(event) {
  if (event.touches.length === 1) {
    isTouching = true;
    lastTouchX = event.touches[0].clientX;
  }
});

container.addEventListener('touchmove', function(event) {
  if (isTouching && event.touches.length === 1) {
    const currentX = event.touches[0].clientX;
    touchDeltaX = (currentX - lastTouchX) * 0.0001; // Adjust sensitivity here
    lastTouchX = currentX;
    scrollDelta += touchDeltaX;
    isScrolling = true;
    event.preventDefault();
  }
});

container.addEventListener('touchend', function(event) {
  isTouching = false;
});


})();
