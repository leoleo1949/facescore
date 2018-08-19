const {
  uploader
} = require('../qcloud')

const Facepp_Api_Key = "GTRCWF_bTma6nBZr0Hi_7tuq4etoGoGa";
const Facepp_Api_Secret = "1ePA3hRnkcjmaA4ykGtTGe8PAbWyweIW";

const https = require('https');
const querystring = require('querystring');

const options = {
  host: 'api-cn.faceplusplus.com',
  path: '/facepp/v3/detect',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
  }
}

async function calScore(imgUrl){
  return new Promise(function(resolve, reject){
    var params = querystring.stringify({
      api_key: Facepp_Api_Key,
      api_secret: Facepp_Api_Secret,
      image_url: imgUrl,
      return_attributes: 'gender,age,glass,facequality,ethnicity,beauty,skinstatus'
    })

    const req = https.request(options, (res) => {
      res.on('data', (d) => {
        let b = JSON.parse('' + d);//将buffer转成JSON
        resolve(b)
      });
    });
    req.on('error', (e) => {
      reject(e)
    });
    req.write(params);
    req.end();
  })
}

module.exports = async ctx => {
  // 获取上传之后的结果
  // 具体可以查看：
  const data = await uploader(ctx.req)
  const res = await calScore(data.imgUrl)
  ctx.state.data = res
}