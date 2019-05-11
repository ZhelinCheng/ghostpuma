/**
 * Created by ChengZheLin on 2019/5/11.
 * Features:
 */

import '@/css/github.css'
import '@less/page/posts.less'
import hljs from 'highlight.js/lib/highlight'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/haml'
import css from 'highlight.js/lib/languages/css'
import less from 'highlight.js/lib/languages/less'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('html', html)
hljs.registerLanguage('css', css)
hljs.registerLanguage('less', less)

hljs.initHighlightingOnLoad()
