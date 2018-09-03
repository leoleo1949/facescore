//index.js
//获取应用实例
const app = getApp()
const rate = [
  0.5000, 0.5239, 0.5478, 0.5714, 0.5948, 0.6179, 0.6404, 0.6628, 0.6844, 0.7054,
  0.7257, 0.7454, 0.7642, 0.7823, 0.7995, 0.8159, 0.8355, 0.8461, 0.8599, 0.8729,
  0.8849, 0.8962, 0.9066, 0.9162, 0.9251, 0.9332, 0.9406, 0.9474, 0.9535, 0.9591,
  0.9641, 0.9686, 0.9726, 0.9762, 0.9793, 0.9821, 0.9846, 0.9868, 0.9887, 0.9904,
  0.9918, 0.9931, 0.9941, 0.9951, 0.9959, 0.9965, 0.9971, 0.9976, 0.9980, 0.9984,
  0.9987
]

Page({
  data: {
    score: 58,
    rank: 67,
    src: "",
    modalFlag: true,
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function (options) {
    let rank;
    if (options.score >= 50) {
      rank = rate[options.score - 50]
    } else {
      rank = 1 - rate[50 - options.score]
    }
    rank = (rank * 100).toFixed(2)
    this.setData({
      src: options.picture,
      score: options.score,
      rank: rank
    })

  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '[有人@我]颜值即正义，扫脸测颜值',
      path: 'pages/index/index'
    }
  },
  save: function () {
    let rank = this.data.rank
    let score = this.data.score
    let src = this.data.src
    this.setData({
      modalFlag: false
    })
    setTimeout(() => {
      wx.getSystemInfo({
        success: function (res) {
          let ratio = res.screenWidth / 750;
          let w = 600,
            h = 850;
          let fs = 36;

          const ctx = wx.createCanvasContext('shareCanvas')
          ctx.fillStyle = 'rgba(2, 11, 28, 0.9)'
          ctx.fillRect(0, 0, w, h)
          ctx.setTextAlign('center')
          ctx.fillStyle = 'rgba(255, 0, 0, 0.8)'
          ctx.setFontSize(fs * ratio)
          ctx.fillText("今日颜值 " + score, w / 2 * ratio, fs * ratio * 1.1)
          ctx.fillText("超越全国 " + rank + "% 的用户", w / 2 * ratio, fs * ratio * 2.2)
          ctx.stroke()

          ctx.drawImage('../../resource/img/qr.png', 0, h * ratio - w * ratio / 325 * 55, w * ratio, w * ratio / 325 * 55)

          wx.getImageInfo({
            src: src,
            success: function (res) {
              let srcW = res.width;
              let srcH = res.height;

              let leftW = w * ratio;
              let leftH = h * ratio - fs * ratio * 3 - w * ratio / 325 * 55;

              if (leftW / leftH > srcW / srcH) {
                let deltW = (leftW - leftH / srcH * srcW) / 2
                ctx.drawImage(src, deltW, fs * ratio * 3, leftH / srcH * srcW, leftH)
              } else {
                let deltH = (leftH - leftW / srcW * srcH) / 2
                ctx.drawImage(src, 0, fs * ratio * 3 + deltH, leftW, leftW / srcW * srcH)
              }

              ctx.draw(false, function () {
                wx.canvasToTempFilePath({
                  canvasId: 'shareCanvas',
                  success: function (res) {
                    wx.saveImageToPhotosAlbum({
                      filePath: res.tempFilePath,
                      fail: function (error) {
                        console.log(error)
                      }
                    })
                  },
                  fail: function (error) {
                    console.log(error)
                  }
                })
              })

            }
          })

        }
      })
    }, 100)
  },
  restart: function () {
    wx.navigateBack();
  },
  modalOk: function () {
    this.setData({
      modalFlag: true
    })
  }
})