import request from 'request';

const URL = 'http://gaode.com/service/poiInfo?query_type=TQUERY&pagesize=20&pagenum=1&qii=true&cluster_state=5&need_utd=true&utd_sceneid=1000&div=PC1000&addr_poi_merge=true&is_classify=true&city=330100&geoobj=120.151936%7C30.283641%7C120.153224%7C30.284323&keywords=%E6%98%9F%E5%B7%B4%E5%85%8B%E5%92%96%E5%95%A1(%E6%9D%AD%E5%B7%9E%E5%AE%9C%E5%AE%B6%E9%81%93%E5%BA%97)';

var data, list, d, result;
request.get(URL, (err, res, body) => {
    if(!err && res.statusCode == 200) {
        console.log(body);
        body = JSON.parse(body);
        data = body.data;
        list = data[0].list;
        d = list[0];
        console.log('返回: \n\n', {
            city: d.cityname,
            name: d.name,
            lat: d.location.lat,
            lng: d.location.lng,
            tel: d.tel
        }, '\n\n');
    }
});
