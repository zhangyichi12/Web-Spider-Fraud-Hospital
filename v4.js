import request from 'request';
import fs from 'fs';

import cities from './data/cities.json';
import keywords from './data/input.js';

const baseURL = 'http://gaode.com/service/poiInfo?query_type=TQUERY&pagesize=20&pagenum=1&qii=true&cluster_state=5&need_utd=true&utd_sceneid=1000&div=PC1000&addr_poi_merge=true&is_classify=true';

const adcodeMap = new Map;
cities.filter((d) => {
    return d.level === 'city'
}).forEach((d) => {
    adcodeMap.set(d.name.substring(0, 2), d.adcode);
});

var data, list, d, obj, result = [];
var spiderIndex = 0, spiderSuccessIndex = 0;
var queryN = keywords.length;

function getURL(i) {
    let city_hospital = keywords[i].substring(0, 2);
    let adcode = adcodeMap.get(city_hospital);
    if(!adcode) return;
    return encodeURI(`${baseURL}&city=${adcode}&keywords=${keywords[i]}`);
}

function query() {
    const url = getURL(spiderIndex);
    request.get(url, (err, res, body) => {
        spiderIndex++;
        if(spiderIndex == queryN) {
            save(result);
            return ;
        }
        if(!err && res.statusCode == 200) {
            body = JSON.parse(body);
            data = body.data;
            if(!data || !data[0]) {
                query();
                return;
            }
            list = data[0].list;
            if(!list || !list[0]) {
                query();
                return;
            }
            d = list[0];
            obj = {
                city: d.cityname,
                name: d.name,
                lat: d.location.lat,
                lng: d.location.lng,
                tel: d.tel
            };
            spiderSuccessIndex++;
            console.log(`${spiderSuccessIndex} / ${spiderIndex} | ${queryN}`);
            result.push(obj);
            save(result);
        }
        else {
            console.log('Error');
        }
        query();
    });
}

function save(obj) {
    fs.writeFile('./data/output.json', JSON.stringify(obj, null, 2), 'utf8', () => {
        console.log('Successfully write into output.json');
    });
}

query();

