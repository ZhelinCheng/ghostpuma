/**
 * Created by ChengZheLin on 2019/5/11.
 * Features:
 */

import '@/css/github.css'
import '@less/page/posts.less'
import hljs from 'highlight.js/lib/highlight'
import javascript from 'highlight.js/lib/languages/javascript'
import shell from 'highlight.js/lib/languages/shell'
import nginx from 'highlight.js/lib/languages/nginx'
import typescript from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/haml'
import css from 'highlight.js/lib/languages/css'
import less from 'highlight.js/lib/languages/less'
import '@/css/gitalk.css'
import Gitalk from 'gitalk'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('shell', shell)
hljs.registerLanguage('nginx', nginx)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('html', html)
hljs.registerLanguage('css', css)
hljs.registerLanguage('less', less)

hljs.initHighlightingOnLoad()
$(function () {
  if (window._SITE_CONFIG) {
    const $comment = $('#gitalk-container')
    const config = _SITE_CONFIG['comment']
    config.id = $comment.attr('data-cid')
    const gitalk = new Gitalk(config)
    gitalk.render('gitalk-container')
  }
})
