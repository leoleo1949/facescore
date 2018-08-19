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
    src: ""
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
      path:'pages/index/index'
    }
  },
  save: function () {

  },
  restart: function () {

    wx.navigateBack();

  }
})