import Community from '../model/community/model.js';
import _ from 'lodash';

import request from 'request';




const pool_size = 20;
const timeout = 100;
const baseURL = 'http://restapi.amap.com/v3/geocode/geo?key=46799a1920f8b8914ad7d0a2db0096d1&address=';

function buildURL(address) {
    return encodeURI(`${baseURL}${address}`);
}


function Pool(source) {
    this.source = source;
    this.reset();
    this.init();
}

Pool.prototype = {
    init: function() {
        this.querying = [];
    },
    reset: function() {
        this.spiderIndex = 0;
        this.queryingIndex = 0;
    },
    process: function(err, res, body, obj) {
        if(!err && res.statusCode == 200) {
            body = JSON.parse(body);
            let data = body.geocodes;
            if(!data || !data[0]) {
                return this.onProcessed();
            }
            let location = data[0].location;
            if(!location) {
                return this.onProcessed();
            }

            location = location.split(',');
            obj.lat = parseFloat(location[1], 10);
            obj.lng = parseFloat(location[0], 10);

            console.log(`${this.spiderIndex} '|' ${this.queryingIndex}`);

            this.saveToMongoDB(obj);
            return this.onProcessed();
        }
        else {
            console.log('Error');
            return this.onProcessed();
        }
    },
    query: function() {
        if(this.queryingIndex > pool_size) return ;
        if(this.spiderIndex >= this.source.length) return ;

        let obj = this.source[this.spiderIndex];
        console.log(obj);
        let url = buildURL(obj.address);
        request.get(url, (err, res, body) => {
            this.process(err, res, body, obj);
        });
        this.spiderIndex++;
        this.queryingIndex++;

        if(this.queryingIndex < pool_size) this.query();
    },
    onProcessed: function() {
        this.queryingIndex--;
        setTimeout(() => {      //Arrow function for binding this.query()
            this.query();
        }, timeout);
    },
    saveToMongoDB: function(obj) {
        Community.find({community_id: obj.community_id}, (err, result) => {
            if(err) {
                console.log('Error search input', err);
                return ;
            }
            else if(_.isEmpty(result)) {    // else if(!result) {
                let newCommunity = new Community(obj);
                Community.create(newCommunity, (err) => {
                    if(err) {
                        console.log('Error save new community', err);
                        return ;
                    }
                    console.log('Successfully created new community');
                });
            }
            else {
                console.log('Community already exist', err);
                return ;
            }
        });
    }
}

export default Pool;
