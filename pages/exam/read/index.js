import {
  formatSeconds,
} from '../../../utils/util.js'

let app = getApp()
Page({
  data: {
    spinShow: false,
    paperAnswerId: null,
    paper: {},
    answer: {},
    timer: null,
    doTime: 0,
    remainTime: 0,
    remainTimeStr: '',
    modalShow: false,
    result: 0,
    timeOutShow: false
  },
  onLoad: function(options) {
    let paperAnswerId = options.id
    let _this = this
    _this.setData({
      spinShow: true
    });
    app.formPost('/api/wx/student/exampaper/answer/read/' + paperAnswerId, null)
      .then(res => {
        _this.setData({
          spinShow: false
        });
        if (res.code === 1) {
          _this.setData({
            paper: res.response.paper,
            answer: res.response.answer,
            paperAnswerId: paperAnswerId,
          });
        }
      }).catch(e => {
        _this.setData({
          spinShow: false
        });
        app.message(e, 'error')
      })
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
  }
})