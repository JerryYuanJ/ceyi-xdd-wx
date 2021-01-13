import {
  formatSeconds
} from '../../../utils/util.js'

let app = getApp()
Page({
  data: {
    spinShow: false,
    paperId: null,
    form: {},
    timer: null,
    doTime: 0,
    remainTime: 0,
    remainTimeStr: '',
    modalShow: false,
    result: 0,
    timeOutShow: false,
    video: '',
    size: '',
    videoLink: ''
  },
  onLoad: function (options) {
    let paperId = options.id
    let _this = this
    _this.setData({
      spinShow: true
    });
    app.formPost('/api/wx/student/exampaper/select/' + paperId, null)
      .then(res => {
        _this.setData({
          spinShow: false
        });
        if (res.code === 1) {
          _this.setData({
            form: res.response,
            paperId: paperId,
            remainTime: res.response.suggestTime * 60
          });
          _this.timeReduce()
        }
      }).catch(e => {
        _this.setData({
          spinShow: false
        });
        app.message(e, 'error')
      })
  },
  selectVideo() {
    var that = this
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: function (res) {
        that.setData({
          video: res.tempFilePath,
          size: (res.size / (1024 * 1024)).toFixed(2)
        })
        that.uploadVideo();
      }
    })
  },
  uploadVideo() {
    wx.showLoading({
      title: '上传进度：0%',
      mask: true
    })
    const uploadTask = wx.uploadFile({
      url: 'https://zxks.xmchoice.cn:7000/api/wx/student/video/upload',
      filePath: this.data.video,
      name: 'file',
      header: {
        'token': wx.getStorageSync('token')
      }, // 设置请求的 header
      formData: {
        token: wx.getStorageSync('token')
      },
      success: function (res) {
        console.log("uploadFile", res)
        // success
        let data = JSON.parse(res.data)
        wx.hideLoading()
        
        if (data.code != 1) {
          wx.showToast({
            title: '上传失败',
            icon: 'none'
          })
        } else {
          wx.showToast({
            title: '上传成功',
          })
          this.setData({
            videoLink: res.response
          })
        }

      },
      fail: function () {
        // fail
        wx.hideLoading()
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        })
      }
    })
    //监听上传进度变化事件
    uploadTask.onProgressUpdate((res) => {
      wx.showLoading({
        title: '上传进度：' + res.progress + '%',
        mask: true //是否显示透明蒙层，防止触摸穿透
      })
      console.log("上传进度", res.progress)
      console.log("已经上传的数据长度，单位 Bytes:", res.totalBytesSent)
      console.log("预期需要上传的数据总长度，单位 Bytes:", res.totalBytesExpectedToSend)
    })
  },
  timeReduce() {
    let _this = this
    let timer = setInterval(function () {
      let remainTime = _this.data.remainTime
      if (remainTime <= 0) {
        _this.timeOut()
      } else {
        _this.setData({
          remainTime: remainTime - 1,
          remainTimeStr: formatSeconds(remainTime),
          doTime: _this.data.doTime + 1
        });
      }
    }, 1000)
    _this.setData({
      timer: timer
    });
  },
  onUnload() {
    clearInterval(this.data.timer)
  },
  returnRecord() {
    wx.reLaunch({
      url: '/pages/record/index',
    });
  },
  timeOut() {
    clearInterval(this.data.timer)
    this.setData({
      timeOutShow: true
    });
  },
  formSubmit: function (e) {
    let _this = this
    if (this.data.timer) {
      clearInterval(this.data.timer)
    }
    wx.showLoading({
      title: '提交中',
      mask: true
    })
    e.detail.value.id = this.data.paperId
    e.detail.value.doTime = this.data.doTime
    app.formPost('/api/wx/student/exampaper/answer/answerSubmit', e.detail.value)
      .then(res => {
        if (res.code === 1) {
          _this.setData({
            modalShow: true,
            result: res.response
          });
        } else {
          app.message(res.message, 'error')
        }
        wx.hideLoading()
      }).catch(e => {
        wx.hideLoading()
        app.message(e, 'error')
      })
  }
})