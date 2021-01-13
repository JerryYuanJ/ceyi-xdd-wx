const app = getApp()
Page({
  data: {
    spinShow: false,
    userName: 'student',
    password: '123456',
    code:''
  },
  onLoad: function(options) {
    this.formSubmit()
    // console.log(this.data)
  },
  formSubmit: function(e) {
    let _this = this
    _this.setData({
      spinShow: true
    });
    wx.login({
      success(wxres) {
        if (wxres.code) {
          if(!e){
          _this.data.code = wxres.code
          }else{
            e.detail.value.code = wxres.code
          }
          app.formPost('/api/wx/student/auth/bind', _this.data || e.detail.value)
            .then(res => {
              _this.setData({
                spinShow: false
              });
              if (res.code == 1) {
                wx.setStorageSync('token', res.response)
                wx.reLaunch({
                  url: '/pages/index/index',
                });
              } else {
                app.message(res.message, 'error')
              }
            }).catch(e => {
              _this.setData({
                spinShow: false
              });
              app.message(e, 'error')
            })
        } else {
          app.message(res.errMsg, 'error')
        }
      }
    })
  },
  register: function(e) {
    wx.navigateTo({
      url: "../register/index"
    })
  }
})