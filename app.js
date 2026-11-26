/* app.js —— 装饰画芯 H5 站点的路由和渲染 */
(function () {
  var D = window.ZS_DATA || { categories: [], months: [], artworks: [], banners: [] }
  var app = document.getElementById('app')

  // 列表页的临时状态（不放进 hash，避免输入框失焦）
  var albumState = { list: [] }
  // 详情页手势起点
  var touchX = 0

  function img(p) {
    if (!p) return ''
    return String(p).replace(/^\//, '')
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  function parseHash() {
    var h = (location.hash || '').replace(/^#/, '')
    if (!h) h = '/'
    var i = h.indexOf('?')
    var path = i >= 0 ? h.slice(0, i) : h
    var qs = i >= 0 ? h.slice(i + 1) : ''
    var params = {}
    if (qs) {
      qs.split('&').forEach(function (kv) {
        if (!kv) return
        var p = kv.split('=')
        params[p[0]] = decodeURIComponent(p[1] || '')
      })
    }
    return { path: path, params: params }
  }

  function nav(title, withBack) {
    return (
      '<div class="nav">' +
      (withBack ? '<div class="nav-back" data-back="1">‹</div>' : '') +
      '<span>' + esc(title) + '</span></div>'
    )
  }

  function tabbar(activeIdx) {
    var items = [
      ['#/', 'home', '首页'],
      ['#/category', 'grid', '详细分类'],
      ['#/updates', 'clock', '最近更新'],
    ]
    return (
      '<div class="tabbar">' +
      items
        .map(function (it, i) {
          var on = i === activeIdx
          return (
            '<a class="tab' + (on ? ' on' : '') + '" href="' + it[0] + '">' +
            '<img src="assets/icons/tab-' + it[1] + (on ? '-active' : '') + '.png" alt="">' +
            '<span>' + it[2] + '</span></a>'
          )
        })
        .join('') +
      '</div>'
    )
  }

  function bannerHtml() {
    var b = D.banners[0]
    if (!b) return ''
    return (
      '<div class="banner">' +
      '<img class="banner-img" src="' + img(b.image) + '" alt="">' +
      '<div class="banner-mask">' +
      '<div class="banner-sub">' + esc(b.sub || '装点生活') + '</div>' +
      '<div class="banner-title">' + esc(b.title || '让一面墙，有故事') + '</div>' +
      '<div class="banner-en">' + esc(b.en || 'MAKEUP DOT LIFE') + '</div>' +
      '<div class="banner-btn" data-go="#/category">CLICK MORE</div>' +
      '</div></div>'
    )
  }

  function catsHtml(list) {
    return (
      '<div class="cat-grid">' +
      list
        .map(function (c) {
          return (
            '<div class="cat-item" data-go="#/album?cat=' + encodeURIComponent(c.id) +
            '&t=' + encodeURIComponent(c.name) + '">' +
            '<div class="cat-cover-wrap"><img class="cat-cover" loading="lazy" src="' +
            img(c.cover) + '" alt=""></div>' +
            '<div class="cat-name">' + esc(c.name) + '</div></div>'
          )
        })
        .join('') +
      '</div>'
    )
  }

  function monthsHtml(list) {
    return (
      '<div class="album-grid">' +
      list
        .map(function (m) {
          return (
            '<div class="album-card" data-go="#/album?mon=' + encodeURIComponent(m.id) +
            '&t=' + encodeURIComponent(m.name) + '">' +
            '<img class="album-card-img" loading="lazy" src="' + img(m.cover) + '" alt="">' +
            '<div class="album-card-mask">' +
            '<div class="album-card-tag">客厅</div>' +
            '<div class="album-card-title">' + esc(m.name) + '</div>' +
            '<div class="album-card-count">(' + esc(m.count) + ')</div>' +
            '</div></div>'
          )
        })
        .join('') +
      '</div>'
    )
  }

  // ---------- 页面 ----------

  function pageHome() {
    var cats = D.categories.filter(function (c) {
      return c.onHome !== false
    })
    var months = D.months.slice(0, 2)
    return (
      nav('装饰画芯展示', false) +
      '<div class="app-shell" style="padding-bottom:0">' +
      '<div style="padding-bottom:13.8667vw">' +
      bannerHtml() +
      catsHtml(cats) +
      '<div class="section">' +
      '<div class="section-head">' +
      '<div class="section-title">最近更新(' + months.length + ')</div>' +
      '<div class="section-more" data-go="#/updates">全部月份 &gt;</div>' +
      '</div>' +
      monthsHtml(months) +
      '</div></div>' +
      tabbar(0) +
      '</div>'
    )
  }

  function pageCategory() {
    var all = D.categories
    var collections = all.slice(-4)
    return (
      nav('详细分类', false) +
      '<div class="app-shell" style="padding-bottom:0">' +
      '<div style="padding-bottom:13.8667vw">' +
      catsHtml(all) +
      '<div class="divider"></div>' +
      '<div class="section">' +
      '<div class="section-head"><div class="section-title">主题合集</div></div>' +
      '<div class="album-grid">' +
      collections
        .map(function (c) {
          return (
            '<div class="album-card collection-card" data-go="#/album?cat=' +
            encodeURIComponent(c.id) + '&t=' + encodeURIComponent(c.name) + '">' +
            '<img class="album-card-img collection-img" loading="lazy" src="' +
            img(c.cover) + '" alt="">' +
            '<div class="album-card-mask"><div class="album-card-title">' +
            esc(c.name) + '</div></div></div>'
          )
        })
        .join('') +
      '</div></div></div>' +
      tabbar(1) +
      '</div>'
    )
  }

  function pageUpdates() {
    return (
      nav('其他月份更新', false) +
      '<div class="app-shell" style="padding-bottom:0">' +
      '<div style="padding-bottom:13.8667vw">' +
      '<div class="section">' +
      '<div class="section-head">' +
      '<div class="section-title">其他月份更新</div>' +
      '<div class="section-more">共 ' + D.months.length + ' 期</div>' +
      '</div>' +
      monthsHtml(D.months) +
      '</div></div>' +
      tabbar(2) +
      '</div>'
    )
  }

  function filterArtworks(p, keyword) {
    var kw = (keyword || '').toLowerCase()
    return D.artworks.filter(function (a) {
      if (p.cat && a.categoryId !== p.cat) return false
      if (p.mon && a.monthId !== p.mon) return false
      if (!kw) return true
      return (
        String(a.name).toLowerCase().indexOf(kw) >= 0 ||
        String(a.code).toLowerCase().indexOf(kw) >= 0 ||
        String(a.categoryName || '').toLowerCase().indexOf(kw) >= 0
      )
    })
  }

  function artListHtml(list, p) {
    if (!list.length) {
      return '<div class="empty-tip">这里还没有画芯<br>换个分类看看</div>'
    }
    return (
      '<div class="art-list" id="art-list">' +
      list
        .map(function (a) {
          return (
            '<div class="art-item" data-go="#/artwork?id=' + encodeURIComponent(a.id) +
            (p.cat ? '&cat=' + encodeURIComponent(p.cat) : '') +
            (p.mon ? '&mon=' + encodeURIComponent(p.mon) : '') + '">' +
            '<div class="art-card">' +
            '<img class="art-img" loading="lazy" src="' + img(a.thumb) + '" alt="">' +
            '<div class="art-meta">' +
            '<div class="art-name">' + esc(a.name) + '</div>' +
            '<div class="art-code">' + esc(a.code) + ' · ' + esc(a.spec) + '</div>' +
            '</div></div></div>'
          )
        })
        .join('') +
      '</div>'
    )
  }

  function pageAlbum(p) {
    var title = p.t || '画芯列表'
    var list = filterArtworks(p, '')
    albumState.list = list
    return (
      nav(title, true) +
      '<div class="app-shell">' +
      '<div class="search-bar"><div class="search-box">' +
      '<span class="search-icon">⌕</span>' +
      '<input class="search-input" id="kw" placeholder="搜编号 / 名称，例如 ZS-2512 或 吉祥如意" autocomplete="off">' +
      '</div></div>' +
      '<div class="count-line" id="count-line">共 ' + list.length + ' 款' +
      (title === '画芯列表' ? '' : ' · ' + esc(title)) + '</div>' +
      '<div id="list-wrap">' + artListHtml(list, p) + '</div>' +
      '</div>'
    )
  }

  function pageArtwork(p) {
    var q = { cat: p.cat, mon: p.mon }
    var list = filterArtworks(q, '')
    var idx = -1
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === p.id) {
        idx = i
        break
      }
    }
    if (idx < 0) {
      list = []
      for (var j = 0; j < D.artworks.length; j++) {
        if (D.artworks[j].id === p.id) {
          list = [D.artworks[j]]
          idx = 0
          break
        }
      }
    }
    if (!list.length) {
      return nav('画芯详情', true) + '<div class="empty-tip">没有找到这张画芯</div>'
    }
    var item = list[idx]
    var prev = idx > 0 ? list[idx - 1] : null
    var next = idx < list.length - 1 ? list[idx + 1] : null

    var base = '#/artwork?id='
    var tail =
      (p.cat ? '&cat=' + encodeURIComponent(p.cat) : '') +
      (p.mon ? '&mon=' + encodeURIComponent(p.mon) : '')

    return (
      '<div class="detail-wrap" style="display:flex;flex-direction:column;height:100vh">' +
      nav('画芯详情', true) +
      '<div class="detail-stage" id="stage">' +
      '<img src="' + img(item.image) + '" alt="">' +
      (prev
        ? '<div class="detail-nav prev" data-go="' + base + encodeURIComponent(prev.id) + tail + '">‹</div>'
        : '<div class="detail-nav prev disabled"></div>') +
      (next
        ? '<div class="detail-nav next" data-go="' + base + encodeURIComponent(next.id) + tail + '">›</div>'
        : '<div class="detail-nav next disabled"></div>') +
      '</div>' +
      '<div class="detail-bar" style="position:static">' +
      '<div class="detail-info">' +
      '<div class="detail-name">' + esc(item.name) + '</div>' +
      '<div class="detail-code">' + esc(item.code) + ' · ' + esc(item.spec) +
      ' · ' + (idx + 1) + '/' + list.length + '</div>' +
      '</div>' +
      '<div class="detail-btns">' +
      '<div class="share-hint" style="display:none"></div>' +
      '</div></div>' +
      '</div>'
    )
  }

  // ---------- 渲染 ----------

  var lastPath = ''

  function render() {
    var r = parseHash()
    var p = r.params
    var html = ''

    if (r.path === '/' || r.path === '') html = pageHome()
    else if (r.path === '/category') html = pageCategory()
    else if (r.path === '/updates') html = pageUpdates()
    else if (r.path === '/album') html = pageAlbum(p)
    else if (r.path === '/artwork') html = pageArtwork(p)
    else html = pageHome()

    app.innerHTML = html

    // 切换页面时回到顶部；同类页面（左右翻图）不动
    if (lastPath !== r.path || r.path === '/album') {
      window.scrollTo(0, 0)
    }
    lastPath = r.path

    // 列表页：绑定搜索
    var kw = document.getElementById('kw')
    if (kw) {
      kw.addEventListener('input', function () {
        var list = filterArtworks(p, kw.value)
        albumState.list = list
        document.getElementById('list-wrap').innerHTML = artListHtml(list, p)
        var cl = document.getElementById('count-line')
        if (cl) {
          cl.innerHTML = '共 ' + list.length + ' 款' + (p.t ? ' · ' + esc(p.t) : '')
        }
      })
    }

    // 详情页：手势滑图
    var stage = document.getElementById('stage')
    if (stage) {
      stage.addEventListener('touchstart', function (e) {
        touchX = e.touches[0].clientX
      })
      stage.addEventListener('touchend', function (e) {
        var dx = e.changedTouches[0].clientX - touchX
        if (Math.abs(dx) < 50) return
        var btns = document.querySelectorAll('.detail-nav:not(.disabled)')
        if (!btns.length) return
        for (var i = 0; i < btns.length; i++) {
          var t = btns[i].className
          if (dx < 0 && t.indexOf('next') >= 0 && btns[i].dataset.go) location.hash = btns[i].dataset.go
          if (dx > 0 && t.indexOf('prev') >= 0 && btns[i].dataset.go) location.hash = btns[i].dataset.go
        }
      })
    }
  }

  // 事件委托
  document.addEventListener('click', function (e) {
    var t = e.target
    while (t && t !== document) {
      if (t.dataset && t.dataset.back) {
        if (history.length > 1) history.back()
        else location.hash = '#/'
        return
      }
      if (t.dataset && t.dataset.go) {
        location.hash = t.dataset.go
        return
      }
      t = t.parentNode
    }
  })

  window.addEventListener('hashchange', render)
  render()
})()
