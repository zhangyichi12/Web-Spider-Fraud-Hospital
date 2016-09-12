import request from 'request';
import fs from 'fs';

const baseURL = 'http://gaode.com/service/poiInfo?query_type=TQUERY&pagesize=20&pagenum=1&qii=true&cluster_state=5&need_utd=true&utd_sceneid=1000&div=PC1000&addr_poi_merge=true&is_classify=true';

//get url
const getURL = function(adcode, keyword) {
    return encodeURI(`${baseURL}&city=${adcode}&keywords=${keyword}`);
}

const URL = getURL('110100', '星巴克咖啡(购物广场店)');

var data, list, d, result;
request.get(URL, (err, res, body) => {
    if(!err && res.statusCode == 200) {
        body = JSON.parse(body);
        data = body.data;
        list = data[0].list;
        d = list[0];
        result = {
            city: d.cityname,
            name: d.name,
            lat: d.location.lat,
            lng: d.location.lng,
            tel: d.tel
        };
        fs.writeFile('./data/output.json', JSON.stringify(result), 'utf8', (err) => {
            if(err) throw err;
            console.log("Write succeed!");
        });
    }
});
