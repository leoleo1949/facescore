//index.js
var config = require('../../config')
var util = require('../../utils/util.js')

//index.js
//获取应用实例
const app = getApp()

Page({
  singleton: {
    interval: null
  },
  data: {
    motto: '扫脸测颜值',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isStarted: false,
    faceScore: 50,
    src: '../../resource/img/default.jpg',
    devicePosition: 'front',
    ready: false,
    maskSrc: '../../resource/img/mask/m1.png'
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function() {
    // if (app.globalData.userInfo) {
    //   this.setData({
    //     userInfo: app.globalData.userInfo,
    //     hasUserInfo: true
    //   })
    // } else if (this.data.canIUse) {
    //   // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //   // 所以此处加入 callback 以防止这种情况
    //   app.userInfoReadyCallback = res => {
    //     this.setData({
    //       userInfo: res.userInfo,
    //       hasUserInfo: true
    //     })
    //   }
    // } else {
    //   // 在没有 open-type=getUserInfo 版本的兼容处理
    //   wx.getUserInfo({
    //     success: res => {
    //       app.globalData.userInfo = res.userInfo
    //       this.setData({
    //         userInfo: res.userInfo,
    //         hasUserInfo: true
    //       })
    //     }
    //   })
    // }
  },
  onShow: function() {
    this.setData({
      ready: true
    })
  },
  onHide: function() {
    this.setData({
      ready: false,
      isStarted: false
    })
  },
  onShareAppMessage: function(res) {
    return {
      title: '[有人@我]颜值即正义，扫脸测颜值',
      path: 'pages/index/index'
    }
  },
  startScan: function() {
    this.setData({
      isStarted: true
    })
    let that = this;
    let rank = 1;
    this.singleton.interval = setInterval(function() {
      rank = (rank) % 12 + 1
      let src = '../../resource/img/mask/m' + rank + '.png'
      that.setData({
        maskSrc: src
      })
    }, 150)

    setTimeout(function() {
      // that.chooseImg((imgPath) => {
      //   that.uploadImg(imgPath, cb)
      // });

      that.takePhoto((imgPath) => {
        that.uploadImg(imgPath, cb)
      });

    }, 1000);

    function cb(res) {
      if (that.data.isStarted) {
        clearInterval(that.singleton.interval);
        that.setData({
          isStarted: false
        })
        if (res) {
          let faces = res.data.faces
          if (faces.length === 1) {
            that.data.faceScore = that.calScore(faces[0])
            wx.navigateTo({
              url: '../result/index?picture=' + that.data.src + '&score=' + that.data.faceScore
            })
          } else if (faces.length < 1) {
            util.showModel('', '您的脸呢？')
          } else {
            util.showModel('', '脸太多，算不过来了')
          }
        } else {
          util.showModel('', '喔唷，出错了！')
        }
      }
    }
  },
  takePhoto: function(cb) {
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.data.src = res.tempImagePath
        cb && cb(this.data.src)
      }
    })
  },
  chooseImg: function(cb) {
    wx.chooseImage({
      success: function(res) {
        var tempFilePaths = res.tempFilePaths
        cb && cb(tempFilePaths[0])
      }
    })

  },
  switchCamera: function() {

    if (this.data.devicePosition == 'front') {
      this.setData({
        devicePosition: 'back'
      })
    } else {
      this.setData({
        devicePosition: 'front'
      })
    }
  },
  imgToBase64: function(path, cb) {
    wx.getImageInfo({
      src: path,
      success: function(res) {
        let w = res.width,
          h = res.height
        let canvas = wx.createCanvasContext('img')
        canvas.drawImage(path, 0, 0, w, h)
        canvas.draw(false, getBase64)

        function getBase64() {
          wx.canvasGetImageData({
            canvasId: 'img',
            x: 0,
            y: 0,
            width: w,
            height: h,
            success(res) {
              debugger
              let pngData = upng.encode([res.data.buffer], res.width, res.height)
              let base64 = wx.arrayBufferToBase64(pngData)
              cb && cb(base64)
            },
            fail(err){
              console.log(err)
            }
          })
        }
      }
    })

  },
  uploadImg: function(path, cb) {
    // 上传图片
    this.uploadImgByServer(path, cb)
    // this.uploadImgDirect(path, cb)
  },
  uploadImgByServer(path, cb){
    const uploadTask = wx.uploadFile({
      url: config.service.uploadUrl,
      filePath: path,
      name: 'file',

      success: function (res) {
        res = JSON.parse(res.data)
        cb && cb(res)
      },

      fail: function (e) {
        cb && cb()
      }
    })
  },
  uploadImgDirect(path, cb) {
    this.imgToBase64(path, (base64) => {
      wx.request({
        url: 'https://api-cn.faceplusplus.com/facepp/v3/detect',
        method: 'POST',
        data: {
          api_key: 'GTRCWF_bTma6nBZr0Hi_7tuq4etoGoGa',
          api_secret: '1ePA3hRnkcjmaA4ykGtTGe8PAbWyweIW',
          return_attributes: 'gender,age,glass,facequality,ethnicity,beauty,skinstatus',
          image_base64: base64
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          cb && cb(res)
        },
        fail: function (e) {
          cb && cb()
        }
      })
    })
  },
  calScore: function(face) {
    let res = face.attributes
    let base = 0
    if (res.gender == "Male") {
      base = res.beauty.male_score
    } else {
      base = res.beauty.female_score
    }
    if (res.skinstatus.dark_circle > 50) {
      base--
    }
    if (res.skinstatus.stain > 50) {
      base--
    }
    if (res.skinstatus.acne > 50) {
      base--
    }
    if (res.skinstatus.health > 50) {
      base++
    }
    if (res.age.value >= 18 && res.age.value <= 24) {
      base++
    }
    return Math.round(base)
  }
})