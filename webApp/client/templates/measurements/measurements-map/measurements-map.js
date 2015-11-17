Template.MeasurementsMap.helpers({
	geolocationError: function() {
		var error = Geolocation.error();
		return error && error.message;
	}	
});


Template.MeasurementsMap.onCreated(function() {
  L.Icon.Default.imagePath = 'packages/bevanhunt_leaflet/images';
  this.mapRendered = false;
  this.bottomLeft = new ReactiveVar;
  this.topRight = new ReactiveVar;
  this.markers = {};

  this.setBounds = function(bounds) {
    if (!bounds) {
      var bounds = this.map.getBounds();
    }
    if (bounds) {
      this.bottomLeft.set([bounds._southWest.lng, bounds._southWest.lat]);
      this.topRight.set([bounds._northEast.lng, bounds._northEast.lat]);
    }    
  };
  var template = this;
  template.autorun(function() {
    template.subscribe('MeasumentsforMap', template.bottomLeft.get(), template.topRight.get());
  });
});

Template.MeasurementsMap.onRendered(function() {
  var template = this;
  template.autorun(function() {
    if (Geolocation.latLng()) {
      latitude = Geolocation.latLng().lat;
      longitude = Geolocation.latLng().lng;
      
      if (!template.mapRendered) {
        template.map = L.map('measurementMap',{
          scrollWheelZoom: false,
          touchZoom : false
        }).setView([latitude, longitude], 15);
        template.mapRendered = true;
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(template.map);
        template.setBounds();
        template.map.on('moveend', function(event) {
          bounds = event.target.getBounds();
          template.setBounds(bounds);
        });
      }
    }
  });
});

Template.MeasurementsMap.onRendered(function() {
  var template = this;

  template.autorun(function() {
    if (template.subscriptionsReady()) {

      Measurements.find().observeChanges({
        'added': function(id, m) {
          if (!template.markers[id]) {
            var coordsArray = [m.location.coordinates[1], m.location.coordinates[0]];
            var fail = m.failure;
            template.markers[id] = new L.marker(coordsArray, {
              icon: createIcon(fail),
              draggable: true,
              riseOnHover: true
            });

            template.map.addLayer(template.markers[id]);
            template.markers[id].bindPopup(Blaze.toHTMLWithData(Template.measurementMarker, m));
          }
        },
        'removed': function(id) {
          template.map.removeLayer(template.markers[id]);
          template.markers[id] = undefined;
        }
      });

    }
  });

});


var createIcon = function(fail) {
  // var className = 'leaflet-div-icon';

  var className = fail ? 'leaflet-div-icon fail' : 'leaflet-div-icon';
  return L.divIcon({
    iconSize: [30, 30],
    className: className  
  });
}


Template.measurementMarker.helpers({

});
