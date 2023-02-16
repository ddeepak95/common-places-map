var container,
  svg,
  dots,
  tooltipGroup,
  markerLocation1,
  markerLocation2,
  marker1,
  marker2,
  drag_handler,
  workingData,
  sourceData,
  filteredData,
  map;

var radiusSlider1 = document.getElementById("radius-slider1");
var radiusField1 = document.getElementById("radius-field1");
radiusField1.innerHTML = radiusSlider1.value;

var radiusSlider2 = document.getElementById("radius-slider2");
var radiusField2 = document.getElementById("radius-field2");
radiusField2.innerHTML = radiusSlider2.value;

radiusSlider1.oninput = function () {
  radiusField1.innerHTML = this.value;
  filterPlaces();
};

radiusSlider2.oninput = function () {
  radiusField2.innerHTML = this.value;
  filterPlaces();
};

markerLocation2 = [
  {
    type: "marker2",
    location: [["-122.137340605259", "37.4225154519081"]],
  },
];

markerLocation1 = [
  {
    type: "marker1",
    location: [["-122.13", "37.44"]],
  },
];

window.addEventListener("load", (event) => {
  loadMap();
});

function initializeElements() {
  // Create new data array
  sourceData = restData;
  sourceData.forEach(function (d) {
    d.coordinates = d.coordinates.reverse();
    d.color = "red";
  });
  workingData = sourceData;
  mapboxgl.accessToken =
    "pk.eyJ1IjoiZGVlcGFrdmQiLCJhIjoiY2xkdGdpczU5MDZrZDNwbndyZ2R1MmJpaSJ9.XbP16hQ6Sw1XUdumVtPJ2Q";
  map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/light-v9",
    center: [-122.15787837072817, 37.421136675263874],
    zoom: 11,
    scrollZoom: false,
    // interactive: false,
  });
  // disable map rotation using right click + drag
  map.dragRotate.disable();

  // disable map rotation using touch rotation gesture
  map.touchZoomRotate.disableRotation();
  map.doubleClickZoom.disable();
  container = map.getCanvasContainer();

  svg = d3
    .select(container)
    .append("svg")
    .attr("width", "100%")
    .attr("height", "2000")
    .style("position", "absolute")
    // .style("z-index", 2)
    .style("cursor", "grab");
  addMarkertoMap1();
  addMarkertoMap2();
  addPlacesToMap(workingData);
  addTooltipToMap();
}

function filterByRating() {
  var rating = document.getElementById("rating").value;
  filteredData = [];
  sourceData.forEach(function (d) {
    var dataRating = parseFloat(d.rating);
    if (dataRating >= rating) {
      filteredData.push(d);
    }
  });
  filterPlaces();
}

function loadMap() {
  initializeElements();
  // Call render method, and whenever map changes
  render();
  filterByRating();
  filterPlaces();
  map.on("viewreset", render);
  map.on("move", render);
  map.on("moveend", render);
}

function filterPlaces() {
  svg.selectAll("*").remove();
  var list = document.getElementById("places-list");
  list.innerHTML = "";
  var filterRadius1 = document.getElementById("radius-slider1").value / 1000;
  var filterRadius2 = document.getElementById("radius-slider2").value / 1000;
  workingData = filteredData;
  var placeCount = 0;
  workingData.forEach(function (d) {
    d.color = "grey";
    var distanceValue1 = distance(
      d.coordinates[1],
      d.coordinates[0],
      markerLocation1[0].location[0][1],
      markerLocation1[0].location[0][0]
    );
    if (distanceValue1 <= filterRadius1) {
      var distanceValue2 = distance(
        d.coordinates[1],
        d.coordinates[0],
        markerLocation2[0].location[0][1],
        markerLocation2[0].location[0][0]
      );
      if (distanceValue2 <= filterRadius2) {
        placeCount++;
        d.color = "red";
        var listElement = document.createElement("div");
        listElement.setAttribute("id", "listElement");
        listElement.setAttribute(
          "class",
          "uk-card uk-card-default uk-card-small"
        );
        listElement.setAttribute("uk-grid", "");
        var imgContainer = document.createElement("div");
        imgContainer.setAttribute("class", "uk-width-auto uk-first-column");
        var image = document.createElement("img");
        var br = document.createElement("br");
        image.setAttribute("src", d.image_url);
        image.setAttribute("class", "placeImg");
        var textContainer = document.createElement("div");
        textContainer.setAttribute("class", "uk-width-expand text-container");
        var title = document.createElement("span");
        title.setAttribute("id", "title");
        var rating = document.createElement("span");
        rating.setAttribute("id", "rating");
        rating.setAttribute("class", "rating");
        rating.innerText = d.rating + "⭐";
        var yelpButton = document.createElement("a");
        yelpButton.setAttribute(
          "class",
          "uk-button uk-button-primary uk-button-small yelpButton"
        );
        yelpButton.setAttribute("href", d.url);
        yelpButton.setAttribute("target", "blank");
        yelpButton.innerText = "View in Yelp";
        title.setAttribute("class", "place-title uk-card-title");
        title.innerText = d.name;
        list.appendChild(listElement);
        listElement.appendChild(imgContainer);
        listElement.appendChild(textContainer);
        textContainer.appendChild(title);
        textContainer.appendChild(rating);
        textContainer.appendChild(br);
        textContainer.appendChild(yelpButton);
        imgContainer.appendChild(image);
      }
    }
  });

  dots.remove();
  marker1.remove();
  marker2.remove();
  addMarkertoMap1();

  addMarkertoMap2();
  addPlacesToMap(workingData);
  addTooltipToMap();
  render();

  var resultsText = document.getElementById("placesCount");
  var noPlacesCount = document.getElementById("noPlaces");
  if (placeCount == 0) {
    noPlacesCount.innerText =
      "No results found for the current filter options!";
  } else {
    resultsText.innerText = placeCount + " results found";
    noPlacesCount.innerText = "";
  }
}

// Render method redraws circles
function render() {
  var radius1 = document.getElementById("radius-slider1").value / 1000;
  var radius2 = document.getElementById("radius-slider2").value / 1000;
  var circleScale = 35;

  marker1
    .data(markerLocation1)
    .attr("r", circleScale * radius1)
    .attr("cx", function (d) {
      return project(d.location[0]).x;
    })
    .attr("cy", function (d) {
      return project(d.location[0]).y;
    });

  marker2
    .data(markerLocation2)
    .attr("r", circleScale * radius2)
    .attr("cx", function (d) {
      return project(d.location[0]).x;
    })
    .attr("cy", function (d) {
      return project(d.location[0]).y;
    });
  dots
    .on("mouseover", function (event, d) {
      // <-- need to use the regular function definition to have access to "this"
      if (d.color != "grey") {
        svg.select("#tooltip-text").text("");
        svg
          .select("#tooltip-text")
          .append("tspan")
          .attr("x", 0)
          .attr("dy", 20)
          .text(d.name)
          .attr("fill", "black")
          .append("tspan")
          .attr("x", 0)
          .attr("dy", 20)
          .text("Rating: ")
          .attr("fill", "black")
          .attr("font-weight", "normal")
          .append("tspan")
          .text(d.rating);
        let positionOffest = 3;
        svg
          .select("#tooltip")
          // move the tooltip to where the cursor is
          .attr(
            "transform",
            `translate(${event.clientX + positionOffest},${
              event.clientY + positionOffest
            })`
          )
          .style("display", "block"); // make tooltip visible

        svg
          .select("#tooltipRect")
          // move the tooltip to where the cursor is
          .attr(
            "transform",
            `translate(${event.clientX + positionOffest + -10},${
              event.clientY + positionOffest + 15
            })`
          )
          .style("display", "block"); // make tooltip visible

        d3.select(this).attr("stroke", "#333333").attr("stroke-width", 2);
      }
    })
    .on("mouseout", function (event, d) {
      svg.select("#tooltip").style("display", "none"); // hide tooltip
      svg.select("#tooltipRect").style("display", "none"); // hide tooltip
      d3.select(this).attr("stroke", "none"); // undo the stroke
    })
    .attr("cx", function (d) {
      return project(d.coordinates).x;
    })
    .attr("cy", function (d) {
      return project(d.coordinates).y;
    });
}

// Projection method:
// Project geojson coordinate to the map's current state
function project(d) {
  return map.project(new mapboxgl.LngLat(d[0], d[1]));
}

function distance(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295; // Math.PI / 180
  var c = Math.cos;
  var a =
    0.5 -
    c((lat2 - lat1) * p) / 2 +
    (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

function addPlacesToMap(dataPoints) {
  dots = svg
    .append("g")
    .attr("id", "dotCircle")
    .selectAll("circle")
    .data(dataPoints)
    .enter()
    .append("circle")
    .attr("r", 2.5)
    .style("opacity", 0.5)
    .style("fill", (d) => d.color);
}

function addMarkertoMap1() {
  marker1 = svg
    .append("g")
    .attr("id", "marker1")
    .selectAll("circle")
    .data(markerLocation1)
    .enter()
    .append("circle")
    .style("opacity", 0.4)
    .style("fill", "blue")
    .style("cursor", "pointer");

  drag_handler = d3.drag().on("drag", dragged).on("end", dragEnded);
  drag_handler(marker1);
}

function addMarkertoMap2() {
  marker2 = svg
    .append("g")
    .attr("id", "marker2")
    .selectAll("circle")
    .data(markerLocation2)
    .enter()
    .append("circle")
    .style("opacity", 0.4)
    .style("fill", "orange")
    .style("cursor", "pointer");
  drag_handler = d3.drag().on("drag", dragged).on("end", dragEnded);
  drag_handler(marker2);
}

function dragged(event, d) {
  d3.select(this)
    .attr("cx", (d.x = event.x))
    .attr("cy", (d.y = event.y));
}

function dragEnded(event, d) {
  var coordinates = map.unproject([event.x, event.y]);
  if (d.type == "marker1") {
    markerLocation1[0].location[0][0] = coordinates.lng;
    markerLocation1[0].location[0][1] = coordinates.lat;
  }
  if (d.type == "marker2") {
    markerLocation2[0].location[0][0] = coordinates.lng;
    markerLocation2[0].location[0][1] = coordinates.lat;
  }
  filterPlaces();
}

function addTooltipToMap() {
  tooltipRect = svg
    .append("rect") // the tooltip needs to be added last so that it stays on top of all circles
    .attr("id", "tooltipRect")
    .style("display", "none") // hidden by default
    .attr("width", 200)
    .attr("height", 50)
    .style("fill", "white")
    .style("opacity", "0.5");
  tooltipGroup = svg
    .append("g") // the tooltip needs to be added last so that it stays on top of all circles
    .attr("id", "tooltip")
    .style("display", "none") // hidden by default
    .append("text")
    .attr("id", "tooltip-text")
    .attr("x", 5)
    .attr("y", 15)
    .attr("font-size", "14px")
    .attr("font-weight", "bold")
    .attr("fill", "black")
    .style("opacity", "1");
}
