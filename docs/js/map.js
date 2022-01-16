
let APP = {
    markers: {
        red: "https://franspaco.com/resources/red_marker.png",
        green: "https://franspaco.com/resources/green_marker.png"
    },
    team_markers: [],
    event_markers: [],
    year: 2022,
    legends: {
        l_rookie: '#7C008F',
        l_0: '#0000FF',
        l_1: '#0033CC',
        l_2: '#006699',
        l_3: '#009966',
        l_4: '#00CC33',
        l_5: '#00FF00',
        l_event: '#FF0000',
    },
    records: [
        2022,
        2020,
        2019
    ]
};

async function initMap() {
    var center = {
        lat: 26.449372,
        lng: -99.131382
    };
    APP.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: center,
        mapTypeControl: false,
        streetViewControl: false,
    });
    APP.init();
}

APP.tba_team = function(team){
    window.open("https://www.thebluealliance.com/team/" + team, '_blank');
}

APP.tba_event = function(event){
    window.open("https://www.thebluealliance.com/event/" + event, '_blank');
}

APP.getMarker = function(rookie_year){
    if(rookie_year === APP.year){
        // #7C008F 
        return 'markers/rookie.png'
    }
    switch(true){
        case (rookie_year < 2000):
            return 'markers/0.png'; // #0000FF
        case (rookie_year < 2005):
            return 'markers/1.png'; // #0033CC
        case (rookie_year < 2010):
            return 'markers/2.png'; // #006699
        case (rookie_year < 2015):
            return 'markers/3.png'; // #009966
        case (rookie_year < 2020):
            return 'markers/4.png'; // #00CC33
        case (rookie_year < 2025):
            return 'markers/5.png'; // #00FF00
    }
}

APP.init = async function(){
    // Get snackbar object
    APP.snackbarContainer = document.querySelector('#search-toast');

    let query_data = parse_query();

    if (query_data.hasOwnProperty("year")){
        let year = parseInt(query_data["year"]);
        if(!isNaN(year)){
            APP.year = year;
        }
    }

    // Set Year in UI
    $('.year').text(APP.year.toString());

    document.title = `FRC Map ${APP.year.toString()}`;

    // Make legends
    $('.mini-box').each((index, obj) => {
        // console.log($(obj));
        $(obj).css({'background-color': APP.legends[$(obj).attr('id')]});
    });

    APP.records.forEach(element => {
        $('#years').append(`<li><a href="?year=${element}">${element}</a></li>`);
    });

    let data = await $.getJSON(`data/season_${APP.year}.json`, () => {});
    APP.data = data;

    let locations = await $.getJSON('https://firstmap.github.io/data/custom_locations.json');

    for (const key in locations) {
        if (locations.hasOwnProperty(key)) {
            const element = locations[key];
            let data_key = "frc" + String(key);
            if(data.teams.hasOwnProperty(data_key)){
                data.teams[data_key].lat = element.lat;
                data.teams[data_key].lng = element.lng;
                // console.log("Updated: " + data_key);
            }
        }
    }

    // Make Regionals
    for (const key in data.events) {
        if (data.events.hasOwnProperty(key)) {
            const element = data.events[key];
            element.edges = [];
            element.edges_visible = false;
            var marker = new google.maps.Marker({
                position: {
                    lat: Number(element.lat),
                    lng: Number(element.lng)
                },
                icon: APP.markers.red,
                map: this.map,
                title: `${element.name} (week ${element.week+1})`
            });
            this.event_markers.push(marker);
            marker.addListener("click", () => {
                APP.tba_event(key);
            });
            marker.addListener("mouseover", () => {
                element.edges.forEach(item => {
                    item.setVisible(true);
                });
            });
            marker.addListener("mouseout", () => {
                element.edges.forEach(item => {
                    item.setVisible(false);
                });
            });
        }
    }
    APP.team_autocomplete = [];
    // Make Teams
    for (const key in data.teams) {
        if (data.teams.hasOwnProperty(key)) {
            const element = data.teams[key];
            APP.team_autocomplete.push({
                value: key,
                label: `${element.team_number} | ${element.nickname}`
            });
            element.edges = [];
            var marker = new google.maps.Marker({
                position: {
                    lat: Number(element.lat),
                    lng: Number(element.lng)
                },
                icon: APP.getMarker(element.rookie_year),
                map: this.map,
                title: `${element.nickname} (${element.team_number})`
            });
            marker.addListener("click", () => {
                APP.tba_team(element.team_number);
            });
            marker.addListener("mouseover", () => {
                element.edges.forEach(item => {
                    item.setVisible(true);
                });
            });
            marker.addListener("mouseout", () => {
                element.edges.forEach(item => {
                    item.setVisible(false);
                });
            });
            element.marker = marker;
            this.team_markers.push(marker);
        }
    }

    // Make Lines
    for (const key in data.teams) {
        if (data.teams.hasOwnProperty(key)) {
            const element = data.teams[key];
            if(!element.hasOwnProperty('events')){
                continue;
            }
            for (const event of element.events) {
                var edge = new google.maps.Polyline({
                    path: [
                        {
                            lat: Number(element.lat),
                            lng: Number(element.lng)
                        },
                        {
                            lat: Number(data.events[event].lat),
                            lng: Number(data.events[event].lng)
                        }
                    ],
                    geodesic: false,
                    strokeColor: '#FF0000',
                    strokeOpacity: 1.0,
                    strokeWeight: 1,
                    map: APP.map,
                });
                edge.setVisible(false);
                data.events[event].edges.push(edge);
                element.edges.push(edge);
            }
        }
    }


    // Get toggles
    this.toggles = {
        teams: $('#switch-teams'),
        events: $('#switch-regionals'),
        tba: $('#switch-tba')
    }

    // Team toggle listener
    this.toggles.teams.change(function() {
        APP.toggle_markers(APP.team_markers, this.checked);
    });
    // Event toggle listener
    this.toggles.events.change(function() {
        APP.toggle_markers(APP.event_markers, this.checked);
    });

    this.goto = function(key){
        if(APP.data.teams.hasOwnProperty(key)){
            APP.map.setCenter(APP.data.teams[key].marker.position);
            APP.map.setZoom(14);
            var data = {message: `${APP.data.teams[key].team_number} | ${APP.data.teams[key].nickname}`};
            APP.snackbarContainer.MaterialSnackbar.showSnackbar(data);
        }else{
            var data = {message: "Could not find team " + key.substring(3)};
            APP.snackbarContainer.MaterialSnackbar.showSnackbar(data);
        }
    }

    // Search listener
    $("#search-bar").on("submit", (e)=>{
        e.preventDefault();
        let number = $('#search-field').val();
        let key = 'frc' + number;
        APP.goto(key);
    });
    $("#search-field").autocomplete({
        // source: APP.team_autocomplete,
        source: function(request, response) {
            var results = $.ui.autocomplete.filter(APP.team_autocomplete, request.term);
            response(results.slice(0, 10));
        },
        focus: function( event, ui ) {
            $( "#search-field" ).val( ui.item.label );
            return false;
        },
        select: (event, ui) => {
            event.preventDefault();
            $("#search-field").val(ui.item.label);
            // $("#search-field").val("");
            APP.goto(ui.item.value);
            return false;
        }
    });
    $(".ui-menu").addClass("mdl-card mdl-shadow--2dp");
}.bind(APP);


APP.toggle_markers = function(array, value){
    array.forEach(element => {
        element.setVisible(value);
    });
}.bind(APP);

function parse_query(){
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    let data = {};
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        data[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }
    return data;
}
