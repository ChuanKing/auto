const fs = require('fs');

const regionSet = new Set(['seattle']);
const titleSet = new Set(['clean']);
const conditionSet = new Set(['fair', 'salvage']);
const minYear = 2014;

exports.handler = async (event) => {

    if (process.argv.length < 3) return;
    var dataPath = `${process.argv[2]}/new.jl`;
    var pagePath = `${process.argv[2]}/index.html`;

    var data = readDataFromFile(dataPath)
        .filter(record => regionSet.has(record['region']))
        .filter(record => titleSet.has(record['title status']))
        .filter(record => !conditionSet.has(record['condition']))
        .filter(record => record['images'].length > 0)
        .filter(record => record['year'] >= minYear);

    var page = createPage(data);
    saveData(pagePath, page)
}

function readDataFromFile(filename) {
    var fileContent = fs.readFileSync(filename, 'utf-8').split('\n');
    var data = [];

    fileContent.forEach(line => {
        if (line.length == 0) return;
        data.push(processingJSON(line));
    });

    return data;
}

function saveData(path, page) {
    fs.writeFile(path, page, (err) => {
        // throws an error, you could also catch it here
        if (err) throw err;

        // success case, the file was saved
        console.log('page saved!');
    });
}

function processingJSON(line) {
    var record = JSON.parse(line)

    record['price'] = parseInt((record['price'] || record['detail-price']).replace(/\D/g, ''));
    record['title status'] = record['attributes']['title status'];
    record['location'] = (record['location'] || "()").trim().slice(1, -1);
    record['condition'] = record['attributes']['condition'] || 'good';
    record['year'] = parseInt((record['attributes']['name'] || '-1').substr(0, 4));

    return record;
}

function createPage(data) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title>craigslist daily reporter</title>
            <style>
                .tile {
                    display: inline-block;
                    width: 300px;
                    height: 300px;
                    margin: 10px;
                    padding: 10px;
                    border: 1px solid gainsboro;
                    border-radius: 3%;
                }
                .tile-image {
                    width: 300px;
                    height: 200px;
                }
            </style>
        </head>
        <body>

            <div class="item-list">
                ${Object.keys(data).map(function (id) {
                    // return "<option value='" + id + "'>" + data[id] + "</option>"           
                    return `
                    <a class="tile" href="${data[id]['link']}">
                        <img class="tile-image" src="${data[id]['images'][0]}" alt="${data[id]['title']}">
                        <div>${data[id]['title']}</div>
                        <div>$${data[id]['price']}</div>
                        <div>${data[id]['attributes']['fuel']}</div>
                        <div>${data[id]['year']}</div>
                    </a>
                    `
                }).join("")}
            </div>
            
        </body>
        </html>
    `;
}