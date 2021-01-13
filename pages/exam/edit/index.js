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
    modalShow: false,
    result: 0
  },
  onLoad: function (options) {
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
  returnRecord() {
    wx.reLaunch({
      url: '/pages/record/index',
    });
  },
  formSubmit: function (e) {
    let _this = this
    wx.showLoading({
      title: '提交中',
      mask: true
    })
    e.detail.value.answerId = this.data.paperAnswerId
    app.formPost('/api/wx/student/exampaper/answer/judgeSubmit', e.detail.value)
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