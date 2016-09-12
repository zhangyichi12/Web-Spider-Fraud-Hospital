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
function query(url) {
    request.get(url, (err, res, body) => {
        spiderIndex++;
        if(!err && res.statusCode == 200) {
            body = JSON.parse(body);
            data = body.data;
            if(!data || !data[0]) return;
            list = data[0].list;
            if(!list || !list[0]) return ;
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
            // save(result);
        }
        else {
            console.log('Error');
        }
    });
}

function save(obj) {
    fs.writeFile('./data/output.json', JSON.stringify(obj, null, 2), 'utf8', () => {
        console.log('Successfully write into output.json');
    });
}

// Without interval
/*
// keywords.forEach((keyword) => {
//     let city_hospital = keyword.substring(0, 2);
//     let adcode = adcodeMap.get(city_hospital);
//     if(!adcode) return;
//     query(`${baseURL}&city=${adcode}&keywords=${keyword}`);
// });
*/

// With Interval
/*
var timeInterval = 3000;
keywords.forEach((keyword, i) => {
    let city_hospital = keyword.substring(0, 2);
    let adcode = adcodeMap.get(city_hospital);
    if(!adcode) return;
    let timeout = timeInterval * i;
    setTimeout(() => {
        query(encodeURI(`${baseURL}&city=${adcode}&keywords=${keyword}`));
    }, timeout);
});
*/

var i = 0;
const main = setInterval(() => {
    if(i == keywords.length) {
        console.log("*");
        save(result);
        clearInterval(main);
        return ;
    }
    let city_hospital = keywords[i].substring(0, 2);
    let adcode = adcodeMap.get(city_hospital);
    if(!adcode) return;
    query(encodeURI(`${baseURL}&city=${adcode}&keywords=${keywords[i]}`));
    i++;
}, 3000);

