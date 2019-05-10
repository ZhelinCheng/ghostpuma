/**
 * Created by ChengZheLin on 2019/5/10.
 * Features:
 */

/* eslint-disable */
import '@less/page/music.less'
import $ from 'jquery'

$(function () {
  if (!_SITE_CONFIG) {
    return console.error('请定义一个全局变量_SITE_CONFIG')
  }

  const musicApi = _SITE_CONFIG.music.api
  const nodes = {
    $musicBox: $('#J-music-box'),
    $musicPanel: $('#J-music-panel'),
    $musicPanelCover: $('#J-panel-cover'),
    $musicPanelTitle: $('#J-panel-title'),
    $musicPanelTime: $('#J-panel-time'),
    $musicPanelLyric: $('#J-panel-lyric'),
    $musicPanelLoad: $('#J-panel-load'),
    musicPanelAudio: document.getElementById('J-panel-audio'),
    $musicPanelPrev: $('#J-panel-prev'),
    $musicPanelControl: $('#J-panel-control'),
    $musicPanelNext: $('#J-panel-next')
  }

  // 保存歌曲列表
  let _MUSIC_LIST = null

  // 保存歌词
  let _MUSIC_LYRIC = []
  let _MUSIC_LEN = 0
  let _MUSiC_INDEX = 0
  let _MUSIC_TIME_TIM = null
  let _MUSIC_TIME_INT = null
  let _MUSIC_TIME_TIM_INDEX = 1

  // 保存歌词时间及补偿时间
  let _MUSIC_TIME_MIN = 0
  let _MUSIC_TIME_SEC = 0
  let _MUSIC_TIME_MS = 0
  let _MUSIC_TIME_MAKE = 0

  let Fn = {
    init: function () {
      this.renderBox()
      this.bind()
      this.setMusicInit()
    },

    varInit: function () {
      clearTimeout(_MUSIC_TIME_TIM)
      clearInterval(_MUSIC_TIME_INT)

      _MUSIC_LYRIC = []
      _MUSIC_LEN = 0 // 歌曲长度
      _MUSIC_TIME_TIM = null
      _MUSIC_TIME_INT = null
      _MUSIC_TIME_TIM_INDEX = 1

      // 保存歌词时间及补偿时间
      _MUSIC_TIME_MIN = 0
      _MUSIC_TIME_SEC = 0
      _MUSIC_TIME_MS = 0
      _MUSIC_TIME_MAKE = 0

      nodes.$musicPanelLyric.text('')
    },

    nextMusic: function () {
      if (_MUSiC_INDEX === _MUSIC_LIST.length - 1) {
        return false
      }

      _MUSiC_INDEX++
      nodes.$musicBox.find('.nm-songlist-item[data-index="' + _MUSiC_INDEX + '"]')
        .addClass('current iconfont')
        .siblings('li')
        .removeClass('current iconfont')
      let item = _MUSIC_LIST[_MUSiC_INDEX]
      this.setMusic(item.id, item)
      return true
    },

    bind: function () {
      let that = this

      // 播放音乐
      nodes.$musicBox.on('click', '.nm-songlist-item', function () {
        let $this = $(this)
        $this.addClass('current iconfont')
          .siblings('li')
          .removeClass('current iconfont')

        let id = $this.data('id')
        let index = $this.data('index')
        Fn.setMusic(id, _MUSIC_LIST[index])
        _MUSiC_INDEX = index
      })

      // 上一曲
      nodes.$musicPanelPrev.click(function () {
        if (_MUSiC_INDEX === 0) {
          return false
        }

        _MUSiC_INDEX--
        nodes.$musicBox.find('.nm-songlist-item[data-index="' + _MUSiC_INDEX + '"]')
          .addClass('current iconfont')
          .siblings('li')
          .removeClass('current iconfont')
        let item = _MUSIC_LIST[_MUSiC_INDEX]
        that.setMusic(item.id, item)
      })

      // 下一曲
      nodes.$musicPanelNext.click(function () {
        that.nextMusic()
      })

      // 获取歌单详情
      nodes.$musicBox.on('click', '.nm-list-item', function () {
        let $this = $(this)
        if (!$this.hasClass('appear')) {
          nodes.$musicPanel.addClass('appear')
        }

        that.renderItem($this.data('id'), $this)
      })

      // 暂停音乐
      let _pause = false
      nodes.$musicPanelControl.click(function () {
        let $this = $(this)
        if (_pause) {
          // 开始
          that.renderTime()
          that.renderLyric(_MUSIC_TIME_MIN, _MUSIC_TIME_SEC, _MUSIC_TIME_MS)
          nodes.musicPanelAudio.play()
          $this.removeClass('icon-play').addClass('icon-stop')
        } else {
          // 暂停
          clearTimeout(_MUSIC_TIME_TIM)
          clearInterval(_MUSIC_TIME_INT)
          _MUSIC_TIME_MAKE = $.now() - _MUSIC_TIME_MAKE
          nodes.musicPanelAudio.pause()
          $this.removeClass('icon-stop').addClass('icon-play')
        }
        _pause = !_pause
      })
    },

    getData: function (url, parame, cb) {
      $.ajax({
        url: url,
        data: parame,
        success: function (db) {
          if (db.code === 200) {
            cb(null, db)
          } else {
            console.error(db)
          }
        },
        error: function () {
          cb(url)
          console.error(url, '错误')
        }
      })
    },

    renderBox: function () {
      // 渲染歌单
      this.getData(musicApi + '/user/playlist',
        {
          uid: _SITE_CONFIG.music.id
        },
        function (err, data) {
          if (err) {
            return false
          }

          data = data.playlist
          let html = '<div class="nm-album-list nm-container">'
          let len = data.length

          function getItem (item) {
            return '<div class="nm-list-item" data-id="' + item.id + '">' +
              '<div class="nm-list-content">' +
              '<img class="music-cover" src="' + item.coverImgUrl.replace(/http:/, '') + '">' +
              '<span class="music-info">' + item.name + '</span>' +
              '</div></div>'
          }

          for (let i = 0; i < len; i++) {
            let dataItem = data[i]
            let re = i % 4

            if (re === 0 && i === 0) {
              html += getItem(dataItem)
            } else if (re === 0 && i !== 0 && i < len - 1) {
              html += '</div><div class="nm-album-list nm-container">'
              html += getItem(dataItem)
            } else if (re !== 0) {
              html += getItem(dataItem)
            }

            if (re !== 0 && i === len - 1) {
              html += '</div>'
            }
          }

          nodes.$musicBox.html(html)
        })
    },

    eleBtn: null,
    renderItem: function (id, ele) {
      // 渲染列表
      let that = this
      this.getData(musicApi + '/playlist/detail', {
        id: id
      }, function (err, data) {
        if (err) {
          return false
        }
        ele.addClass('is-active')

        if (that.eleBtn) {
          that.eleBtn.removeClass('is-active')
        }

        that.eleBtn = ele

        data = data.playlist

        let html = '<div class="nm-songs"><div class="nm-songs-title nm-container">' +
          data.name + '</div><div class="nm-songs-list nm-container">\n' +
          '<ul class="nm-songlist threerow">{{#list}}</ul></div></div>'

        data = data.tracks
        ele = ele.parent()

        let list = ''
        for (let i = 0; i < data.length; i++) {
          if (!i) {
            _MUSiC_INDEX = i
            that.setMusic(data[i].id, data[i])
          }

          let item = data[i]
          list += '<li data-index="' + i + '" data-id="' + item.id + '" class="nm-songlist-item' + (function () {
              return !i ? ' current iconfont' : ''
            })() + '">' +
            '<span class="song-info">' + item.name + ' - ' +
            (item.ar.length > 1 ? item.ar[0].name + '/' + item.ar[1].name : item.ar[0].name) +
            '</span></li>'
        }
        _MUSIC_LIST = data
        ele.siblings('.nm-songs').remove()
        ele.after(html.replace(/{{#list}}/, list))
      })
    },

    setMusic: function (id, info) {
      // 初始化
      this.varInit()

      this.musicId = id

      let albumUrl = info.al.blurPicUrl || info.al.picUrl

      nodes.$musicPanelCover.css('background-image', 'url("' + albumUrl.replace(/http:/, '') + '")')

      // 设置基础数据
      nodes.$musicPanelTitle.text(info.name + ' - ' +
        (info.ar.length > 1 ? info.ar[0].name + '/' + info.ar[1].name : info.ar[0].name))

      // 设置音乐
      nodes.musicPanelAudio.setAttribute('src', 'https://music.163.com/song/media/outer/url?id=' + id + '.mp3')
      nodes.musicPanelAudio.load()
    },

    musicId: 0,
    setMusicInit: function () {
      // 元信息加载完成
      nodes.musicPanelAudio.addEventListener('loadedmetadata', function () {
        _MUSIC_LEN = nodes.musicPanelAudio.duration
        nodes.$musicPanelLoad.css('width', 0)
        nodes.$musicPanelTime.text('00:00')
      })

      // 可播放
      let that = this
      nodes.musicPanelAudio.addEventListener('canplaythrough', function () {
        nodes.musicPanelAudio.paused && (nodes.musicPanelAudio.play())
        that.renderTime()
        nodes.$musicPanelControl.removeClass('icon-play').addClass('icon-stop')

        // 获取歌词信息
        /*that.getLyric(that.musicId, function (err) {
          nodes.musicPanelAudio.paused && (nodes.musicPanelAudio.play())
          that.renderTime()
          nodes.$musicPanelControl.removeClass('icon-play').addClass('icon-stop')
          if (!err) {
            that.renderLyric()
          }

        })*/
      }, false)

      //结束后触发
      nodes.musicPanelAudio.addEventListener('ended', function () {
        if (!that.nextMusic()) {
          that.varInit()
        }
      }, false)

      //错误时触发
      nodes.musicPanelAudio.addEventListener('error', function () {
        if (!that.nextMusic()) {
          that.varInit()
        }
      }, false)
    },

    renderTime: function () {
      // 渲染进度
      _MUSIC_TIME_INT = setInterval(function () {
        let time = nodes.musicPanelAudio.currentTime
        nodes.$musicPanelLoad.css('width', (time / _MUSIC_LEN * 100) + '%')

        let m = Math.floor(time / 60)
        let s = Math.floor(time % 60)

        nodes.$musicPanelTime.text((m > 9 ? m : '0' + m) + ':' + (s > 9 ? s : '0' + s))
      }, 1000)
    },

    renderLyric: function (pMin, pSec, pMs) {
      // 渲染歌词
      if (!_MUSIC_LYRIC || _MUSIC_TIME_TIM_INDEX >= _MUSIC_LYRIC.length) {
        return false
      }

      if (_MUSIC_TIME_MAKE.toString().length >= 10) {
        _MUSIC_TIME_MAKE = 0
      }

      let that = this

      pMin = pMin || 0
      pSec = pSec || 0
      pMs = pMs || 0

      let min = /\d{2}(?=:)/ // 获取分钟
      let sec = /\d{2}(?=\.)/ // 获取秒
      let ms = /\d{2,3}(?=\])/ // 获取毫秒
      let time = _MUSIC_LYRIC[_MUSIC_TIME_TIM_INDEX][0]

      time = time.toString()

      min = min.exec(time)
      sec = sec.exec(time)
      ms = ms.exec(time)

      if (!min) {
        _MUSIC_TIME_TIM_INDEX++
        this.renderLyric()
        return false
      }

      min = parseInt(min[0])
      sec = parseInt(sec[0])
      ms = parseInt(ms[0])

      time = (min - pMin) * 60 * 1000 + (sec - pSec) * 1000 + (ms - pMs) - _MUSIC_TIME_MAKE

      _MUSIC_TIME_MAKE = $.now()
      _MUSIC_TIME_TIM = setTimeout(function () {
        nodes.$musicPanelLyric.text(_MUSIC_LYRIC[_MUSIC_TIME_TIM_INDEX++][1])
        // 保存上一次时间
        _MUSIC_TIME_MIN = min
        _MUSIC_TIME_SEC = sec
        _MUSIC_TIME_MS = ms

        that.renderLyric(min, sec, ms)
      }, time)
    },

    getLyric: function (id, cb) {
      // 获取歌词
      this.getData(musicApi + '/lyric', {
        id: id
      }, function (err, data) {

        if (err || !data.lrc) {
          cb(err)
          return false
        }

        let lyric = data.lrc.lyric.split('\n')

        let len = lyric.length

        for (let i = 0; i < len; i++) {
          let item = lyric[i]

          if (!item) {
            continue
          }

          item = item.split(']')

          if (item.length > 2) {
            _MUSIC_LYRIC.push([
              item[1] + ']',
              item[2]
            ])
          } else {
            _MUSIC_LYRIC.push([
              item[0] + ']',
              item[1]
            ])
          }
        }

        cb(null)
        nodes.$musicPanelLyric.text(_MUSIC_LYRIC[0][1])
      })
    }
  }

  Fn.init()
})
