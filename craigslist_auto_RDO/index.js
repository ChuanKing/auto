const fs = require('fs');

var today;
var rawDataPath;
var processedDataPath;

exports.handler = async (event) => {

    if (process.argv.length < 5) return;
    today = process.argv[2];
    rawDataPath = process.argv[3];
    processedDataPath = process.argv[4];

    console.log(`Processing Data...`);

    let rawData = await getRawData();
    let historicalData = await getHistoricalData();
    let processedData = await processingData(rawData, historicalData);

    await saveData(processedData, 'NEW');
    await saveData(processedData, 'HISTORICAL');
    await saveData(processedData, 'EXPIRED');

    console.log('DONE');
}

async function getRawData() {
    return readDataFromFile(`${rawDataPath}/${today}.jl`);
}

async function getHistoricalData() {
    return readDataFromFile(`${processedDataPath}/historical.jl`);
}

function readDataFromFile(filename) {
    var fileContent = fs.readFileSync(filename, 'utf-8').split('\n');
    var data = {};

    fileContent.forEach(line => {
        if (line.length == 0) return;

        var json = JSON.parse(line);
        var region = json['region'];
        var id = json['id'];

        data[region] = data[region] || {};
        if (data[region][id]) {
            console.log('repeat found');
        }
        data[region][id] = json;
    });

    return data;
}

async function processingData(rawData, historicalData) {
    var newData = [];
    var historical = [];
    var expiredData = [];

    for (var region in rawData) {
        var regionRawRecords = rawData[region];
        var regionhistoricalRecords = historicalData[region] || {};

        for (var id in regionRawRecords) {
            // update existing data
            if (regionhistoricalRecords[id]) {
                var historicalRecord = regionhistoricalRecords[id];
                historicalRecord['start'] = historicalRecord['start'] || today;
                historicalRecord['end'] = today;

                delete regionhistoricalRecords[id];
                historical.push(historicalRecord);
            }
            // new data
            else {
                var newRecord = regionRawRecords[id];
                newRecord['start'] = today;
                newRecord['end'] = today;

                historical.push(newRecord);
                newData.push(newRecord);
            }
        }
    }

    for (var region in rawData) {
        for (var id in historicalData[region]) {
            expiredData.push(historicalData[region][id]);
        }
    }

    return {
        'NEW': newData,
        'HISTORICAL': historical,
        'EXPIRED': expiredData
    }
}

async function saveData(processedData, type) {
    // console.log(`saving ${type} data...`);
    var fileName = `${processedDataPath}/${type.toLowerCase()}.jl`;

    if (fs.existsSync(fileName)) {
        fs.unlinkSync(fileName);
    }

    var logger = fs.createWriteStream(fileName, {
        flags: 'a'
    });

    var data = processedData[type];

    data.forEach(item => {
        var content = JSON.stringify(item);
        logger.write(`${content}\n`);
    });

    logger.end();
}