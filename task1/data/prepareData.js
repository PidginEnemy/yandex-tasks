/* Источники данных, полученных из API FlightStats */
var DATA_PATHS = {
        departures: {
            flightType: 1,
            url: 'data/api/departures.json'
        },
        arrivals: {
            flightType: 2,
            url: 'data/api/arrivals.json'
        }
    },
    resultData = {
        departures: [],
        arrivals: []
    };

/* Обработка данных из API для удобного представления в верстке */
for(var dataPath in DATA_PATHS) {
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET',DATA_PATHS[dataPath].url,false);
    xhr.send();

    if(xhr.status != 200) {
        console.log(xhr.status + ':' + xhr.statusText);
    } else {
        try {
            var data = JSON.parse(xhr.responseText);
            for(var i=0; i < data.flightStatuses.length; i++) {
                var item = data.flightStatuses[i];

                var date = (dataPath === 'departures') ? new Date(item['departureDate'].dateLocal) : new Date(item['arrivalDate'].dateLocal),
                    year = date.getFullYear(),
                    month = date.getMonth() + 1,
                    day = date.getDate(),
                    hours = date.getUTCHours(),
                    minutes = date.getUTCMinutes(),
                    flightDateStr = formatPartTime(day) + '.' + formatPartTime(month) + '.' + year,
                    flightTimeStr = formatPartTime(hours) + ':' + formatPartTime(minutes);
                
                resultData[dataPath].push({
                    flightType: DATA_PATHS[dataPath].flightType,
                    carrierFsCode: item.carrierFsCode,
                    flightNumber: item.flightNumber,
                    airlineName: data.appendix.airlines.filter(function(e) { return e.fs == item.carrierFsCode })[0].name,
                    airportCode: item.arrivalAirportFsCode,
                    airportName: data.appendix.airports.filter(function(e) { var fieldName = (dataPath === 'departures') ? 'arrivalAirportFsCode' : 'departureAirportFsCode'; return e.cityCode === item[fieldName]; })[0].name,
                    flightMachineName: data.appendix.equipments.filter(function(e) { return e.iata == item.flightEquipment.scheduledEquipmentIataCode; })[0].name,
                    flightMachineShortName: item.flightEquipment.scheduledEquipmentIataCode,
                    flightDate: date,
                    flightDateStr: flightDateStr,
                    flightTimeStr: flightTimeStr,
                    codeshares: (item.codeshares) ? item.codeshares : []
                });
            }
        } catch(e) {
            alert('Неккоректный ответ' + e.message);
        }
    }        
}

function formatPartTime(part) {
    if(part < 10)
        return '0' + part;
    return part;
}

function sortByDates(a,b) {
    var dateA = new Date(a.flightDate).getTime();
    var dateB = new Date(b.flightDate).getTime();
    return dateA > dateB ? 1 : -1;  
}

resultData.departures.sort(sortByDates);
resultData.arrivals.sort(sortByDates);

console.log(resultData);