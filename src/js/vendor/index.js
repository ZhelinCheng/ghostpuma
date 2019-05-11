/**
 * Created by ChengZheLin on 2019/5/7.
 * Features: 全局引用
 */
// import 'expose-loader?$!expose-loader?jQuery!jquery'
import echo from '@rely/echo'

echo.init({
  offset: 100,
  throttle: 250,
  unload: false,
  callback: function (element) {
    element.onload = function () {
      let className = 'loading'
      if (element.classList) {
        element.classList.remove(className)
      } else {
        element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ')
      }
    }
  }
})
