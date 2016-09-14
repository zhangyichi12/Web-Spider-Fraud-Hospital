/* Save data to mongoDB */
import mongoose from 'mongoose';
import Hospital from './model/hospital/model.js';
import _ from 'lodash';

import request from 'request';
import fs from 'fs';

import cities from './data/cities.json';
import keywords from './data/input.js';

//Connect to MongoDB
mongoose.connect('mongodb://localhost/FraudHospital');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'console error'));
db.once('open', () => {
    console.log('Connected to MongoDB!');
});

const baseURL = 'http://gaode.com/service/poiInfo?query_type=TQUERY&pagesize=20&pagenum=1&qii=true&cluster_state=5&need_utd=true&utd_sceneid=1000&div=PC1000&addr_poi_merge=true&is_classify=true';

//Pre process
const adcodeMap = new Map;
cities.filter((d) => {
    return d.level === 'city'
}).forEach((d) => {
    adcodeMap.set(d.name.substring(0, 2), d.adcode);
});

var data, list, d, obj, result = [];
var spiderIndex = 0, spiderSuccessIndex = 0;
var queryN = keywords.length;

//Build url
function getURL(i) {
    let city_hospital = keywords[i].substring(0, 2);
    let adcode = adcodeMap.get(city_hospital);
    if(!adcode) return;
    return encodeURI(`${baseURL}&city=${adcode}&keywords=${keywords[i]}`);
}

function saveToFile(obj) {
    fs.writeFile('./data/output.json', JSON.stringify(obj, null, 2), 'utf8', () => {
        console.log('Successfully write into output.json');
    });
}

function saveToMongoDB(obj) {
    Hospital.find({hospital_id: obj.hospital_id}, (err, result) => {
        if(err) {
            console.log('Error search input', err);
            return ;
        }
        else if(_.isEmpty(result)) {    // else if(!result) {
            const newHospital = new Hospital(obj);
            Hospital.create(newHospital, (err) => {
                if(err) {
                    console.log('Error save new hospital', err);
                    return ;
                }
                console.log('Successfully created new hospital');
            });
        }
        else {
            console.log('Hospital already exist', err);
            return ;
        }
    });
}

function query() {
    const url = getURL(spiderIndex);
    request.get(url, (err, res, body) => {
        let keyword = keywords[spiderIndex];
        spiderIndex++;
        if(spiderIndex == queryN) {
            saveToFile(result);
            process.exit();
            return ;
        }
        if(!err && res.statusCode == 200) {
            body = JSON.parse(body);
            data = body.data;
            if(!data || !data[0]) {
                console.log('No data.');
                setTimeout(query, 1000);
                return;
            }
            list = data[0].list;
            if(!list || !list[0]) {
                console.log('Empty list.')
                setTimeout(query, 1000);
                return;
            }
            d = list[0];
            obj = {
                city: d.cityname,
                name: d.name,
                lat: d.location.lat,
                lng: d.location.lng,
                tel: d.tel,
                hospital_id: keyword
            };
            spiderSuccessIndex++;
            console.log(`${spiderSuccessIndex} / ${spiderIndex} | ${queryN}`);
            result.push(obj);
            saveToFile(result); //Dev, In case of cancelling.
            saveToMongoDB(obj);
        }
        else {
            console.log('Error');
        }
        setTimeout(query, 1000);
    });
}

query();