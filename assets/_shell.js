
(function(){
  var NAV = window.__MPA_NAV__;
  if(!NAV) return;
  var base = NAV.base || '/';
  var seq = NAV.sequence || [];

  var path = decodeURIComponent(location.pathname);
  // 当前页定位（与 findCurrentIndex() 同逻辑）：先精确匹配 e.url（http 根路径），
  // 未命中再按 "/"+relPath 后缀匹配，兼容 file:// 全盘路径与子路径部署，取最长后缀。
  var curIdx = seq.findIndex(function(e){ return e.url === path; });
  if(curIdx < 0){
    var stripExt = function(s){ return s.replace(/\/+$/,'').replace(/\.html?$/i,''); };
    var np = stripExt(path), bestLen = -1;
    for(var k=0;k<seq.length;k++){
      var tail = '/' + stripExt(seq[k].relPath);
      if(np.length>=tail.length && np.slice(np.length-tail.length)===tail && tail.length>bestLen){ curIdx = k; bestLen = tail.length; }
    }
  }

  // 翻页目标下标（与 navTargets() 同逻辑）：首页/未匹配(curIdx<0)时
  // 「下一页 / →」指向第一篇，使封面也能直接开始阅读。返回 null 表示无目标。
  function prevTarget(){ return curIdx>0 ? seq[curIdx-1] : null; }
  function nextTarget(){
    if(curIdx<0) return seq.length ? seq[0] : null;
    return curIdx<seq.length-1 ? seq[curIdx+1] : null;
  }
  function goPrev(){ var t=prevTarget(); if(t) navigate(t.url); }
  function goNext(){ var t=nextTarget(); if(t) navigate(t.url); }

  var de = document.documentElement;
  var mobile = matchMedia('(max-width: 760px)');
  var mobileOpen = false;
  var mobileStyle = document.createElement('link');
  mobileStyle.rel = 'stylesheet';
  mobileStyle.href = base.replace(/\/$/, '') + '/assets/mobile.css';
  document.head.appendChild(mobileStyle);
  de.style.setProperty('padding-left','280px');
  de.style.setProperty('padding-top','48px');
  de.style.setProperty('box-sizing','border-box');

  var host = document.createElement('div');
  host.id = 'f2m-host';
  document.body.appendChild(host);
  var sd = host.attachShadow({mode:'open'});
  var style = document.createElement('style');
  style.textContent = "\n:host{all:initial}\n*{box-sizing:border-box}\n.f2m-side{position:fixed;left:0;top:0;bottom:0;width:280px;background:#12161c;border-right:1px solid rgba(255,255,255,.08);display:flex;flex-direction:column;font-family:-apple-system,\"PingFang SC\",\"Microsoft YaHei\",sans-serif;z-index:2147483000;transition:transform .2s}\n.f2m-side.hid{transform:translateX(-100%)}\n.f2m-head{display:flex;align-items:center;border-bottom:1px solid rgba(255,255,255,.08)}\n.f2m-side h1{flex:1;font-size:14px;font-weight:700;color:#e8eaed;padding:14px 16px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.f2m-collapse{flex:0 0 auto;width:34px;height:34px;margin-right:8px;display:flex;align-items:center;justify-content:center;background:transparent;color:#9aa3ad;border:1px solid rgba(255,255,255,.12);border-radius:7px;cursor:pointer;font-size:14px}\n.f2m-collapse:hover{border-color:#37c0e6;color:#37c0e6}\n.f2m-reveal{position:fixed;left:0;top:0;bottom:0;width:30px;display:none;align-items:flex-start;justify-content:center;padding-top:13px;background:#12161c;border-right:1px solid rgba(255,255,255,.08);cursor:pointer;z-index:2147483000;color:#9aa3ad}\n.f2m-reveal:hover{color:#37c0e6}\n.f2m-reveal.show{display:flex}\n.f2m-tree{flex:1;overflow-y:auto;overflow-x:hidden;padding:6px;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.22) transparent}\n.f2m-node{user-select:none}\n.f2m-row{display:flex;align-items:center;gap:6px;padding:5px 8px;border-radius:6px;font-size:13px;color:#c4ccd4;cursor:pointer;text-decoration:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.f2m-row:hover{background:rgba(255,255,255,.05)}\n.f2m-file.on>.f2m-row{background:rgba(55,192,230,.16);color:#fff}\n.f2m-dir>.f2m-row{color:#9aa3ad;font-weight:600}\n.f2m-kids{padding-left:14px}\n.f2m-collapsed>.f2m-kids{display:none}\n.f2m-caret{width:10px;display:inline-block;transition:transform .15s}\n.f2m-collapsed>.f2m-row .f2m-caret{transform:rotate(-90deg)}\n.f2m-top{position:fixed;left:280px;right:0;top:0;height:48px;display:flex;align-items:center;gap:8px;padding:0 16px;background:rgba(18,22,28,.85);backdrop-filter:blur(8px);border-bottom:1px solid rgba(255,255,255,.08);z-index:2147483000;transition:left .2s}\n.f2m-top.full{left:0}\n.f2m-top button{background:#0b0e12;color:#e8eaed;border:1px solid rgba(255,255,255,.12);border-radius:7px;padding:6px 12px;font-size:13px;cursor:pointer}\n.f2m-top button:hover:not(:disabled){border-color:#37c0e6;color:#37c0e6}\n.f2m-top button:disabled{opacity:.35;cursor:not-allowed}\n.f2m-cur{flex:1;font-size:13px;color:#9aa3ad;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.f2m-mask{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:2147483600;display:none;align-items:flex-start;justify-content:center}\n.f2m-mask.show{display:flex}\n.f2m-palette{margin-top:12vh;width:min(640px,92vw);background:#161b22;border:1px solid rgba(255,255,255,.14);border-radius:12px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.6);font-family:-apple-system,sans-serif}\n.f2m-palette input{width:100%;padding:16px 18px;background:transparent;border:0;border-bottom:1px solid rgba(255,255,255,.08);color:#e8eaed;font-size:15px;outline:none}\n.f2m-results{max-height:50vh;overflow:auto}\n.f2m-item{padding:10px 18px;font-size:14px;color:#c4ccd4;cursor:pointer;display:flex;justify-content:space-between;gap:12px}\n.f2m-item .p{color:#5b6470;font-size:12px;font-family:ui-monospace,monospace}\n.f2m-item.sel{background:rgba(55,192,230,.16);color:#fff}\n.f2m-hint{position:fixed;right:16px;bottom:16px;background:rgba(18,22,28,.9);border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:8px 12px;font-size:12px;color:#9aa3ad;z-index:2147483000;opacity:0;transition:opacity .3s;font-family:-apple-system,sans-serif;pointer-events:none}\n.f2m-hint.show{opacity:1}\n.f2m-fab{position:fixed;right:18px;bottom:18px;width:38px;height:38px;border-radius:50%;background:#161b22;border:1px solid rgba(255,255,255,.14);color:#9aa3ad;font-size:16px;font-weight:700;cursor:pointer;z-index:2147483000;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(0,0,0,.4)}\n.f2m-fab:hover{border-color:#37c0e6;color:#37c0e6}\n.f2m-help{margin-top:14vh;width:min(440px,92vw);background:#161b22;border:1px solid rgba(255,255,255,.14);border-radius:14px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.6);font-family:-apple-system,\"PingFang SC\",\"Microsoft YaHei\",sans-serif}\n.f2m-help-h{padding:16px 20px;font-size:15px;font-weight:700;color:#e8eaed;border-bottom:1px solid rgba(255,255,255,.08);display:flex;justify-content:space-between;align-items:center}\n.f2m-help-h .x{color:#5b6470;cursor:pointer;font-size:18px;line-height:1}\n.f2m-help-h .x:hover{color:#e8eaed}\n.f2m-help-list{padding:10px 20px 18px}\n.f2m-kbd-row{display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.05)}\n.f2m-kbd-row:last-child{border-bottom:0}\n.f2m-kbd-row .desc{font-size:14px;color:#c4ccd4}\n.f2m-kbd-row .keys{display:flex;gap:5px}\n.f2m-kbd-row kbd{background:#0b0e12;border:1px solid rgba(255,255,255,.16);border-bottom-width:2px;border-radius:6px;padding:3px 8px;font-size:12px;color:#e8eaed;font-family:ui-monospace,monospace;min-width:24px;text-align:center}\n";
  sd.appendChild(style);
  var touchStyle = document.createElement('style');
  touchStyle.textContent = '.f2m-menu,.f2m-home,.f2m-backdrop{display:none}button:focus-visible,a:focus-visible{outline:2px solid #37c0e6;outline-offset:2px}@media(max-width:760px){.f2m-top{left:0!important;height:calc(56px + env(safe-area-inset-top));padding:env(safe-area-inset-top) 10px 0;gap:6px;justify-content:space-between}.f2m-top button,.f2m-home{min-width:44px;min-height:44px;padding:8px;font-size:13px;flex-shrink:0}.f2m-menu,.f2m-home{display:inline-flex;align-items:center;justify-content:center}.f2m-home{color:#e8eaed;text-decoration:none;border:1px solid #ffffff1f;border-radius:7px;background:#0b0e12}.f2m-cur,.f2m-fullscreen,.f2m-shortcuts,.f2m-fab,.f2m-reveal,.f2m-hint{display:none!important}.f2m-side{width:min(320px,85vw);padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom);z-index:2147483500}.f2m-side h1{font-size:16px}.f2m-row{min-height:44px;white-space:normal;line-height:1.5;padding:10px}.f2m-collapse{width:44px;height:44px}.f2m-backdrop.show{display:block;position:fixed;inset:0;background:#0009;border:0;z-index:2147483400}.f2m-palette{margin-top:calc(65px + env(safe-area-inset-top));width:calc(100vw - 24px)}.f2m-palette input{font-size:16px}.f2m-item{min-height:48px}.f2m-item .p{display:none}.f2m-results{max-height:60dvh}}';
  sd.appendChild(touchStyle);

  var root = document.createElement('div');
  sd.appendChild(root);

  // 存储能力探测：file:// 下浏览器禁用 localStorage，需回退到 URL 参数透传
  var storageOK=(function(){try{localStorage.setItem('f2m_t','1');localStorage.removeItem('f2m_t');return true;}catch(_){return false;}})();
  function navigate(url){
    // file:// 回退：把侧栏 / 全屏状态带到目标 URL 查询参数（不影响 pathname 匹配）
    if(!storageOK){
      url=url.replace(/([?&])f2m(side|full)=[01]/g,'$1').replace(/&&/g,'&').replace(/[?&]$/,'');
      var sep=url.indexOf('?')>=0?'&':'?';
      url=url+sep+'f2mside='+(sideHidden?'1':'0')+'&f2mfull='+(full?'1':'0');
    }
    location.href=url;
  }
  function readSide(){
    if(storageOK){try{return localStorage.getItem('f2m-side-hidden')==='1';}catch(_){}}
    return /[?&]f2mside=1/.test(location.search);
  }
  function writeSide(v){ if(storageOK){try{localStorage.setItem('f2m-side-hidden',v?'1':'0');}catch(_){}} }
  function readFull(){
    if(storageOK){try{return localStorage.getItem('f2m-full')==='1';}catch(_){}}
    return /[?&]f2mfull=1/.test(location.search);
  }
  function writeFull(v){ if(storageOK){try{localStorage.setItem('f2m-full',v?'1':'0');}catch(_){}} }

  function buildTree(node, parent){
    (node.children||[]).forEach(function(c){
      var wrap = document.createElement('div');
      wrap.className = 'f2m-node ' + (c.type==='dir'?'f2m-dir':'f2m-file');
      var row = document.createElement(c.type==='dir'?'div':'a');
      row.className = 'f2m-row';
      if(c.type==='dir'){
        var caret=document.createElement('span'); caret.className='f2m-caret'; caret.textContent='▾'; row.appendChild(caret);
        var nm=document.createElement('span'); nm.textContent=c.name; row.appendChild(nm);
        var kids=document.createElement('div'); kids.className='f2m-kids';
        row.addEventListener('click',function(){wrap.classList.toggle('f2m-collapsed');});
        wrap.appendChild(row); wrap.appendChild(kids);
        buildTree(c, kids);
      } else {
        var url = base.replace(/\/$/,'') + '/' + c.relPath.split('/').map(encodeURIComponent).join('/');
        row.setAttribute('href', url);
        row.addEventListener('click',function(ev){ if(ev.metaKey||ev.ctrlKey||ev.shiftKey||ev.button!==0)return; ev.preventDefault(); navigate(this.getAttribute('href')); });
        var lab=document.createElement('span'); lab.textContent=c.title; lab.title=c.title; row.appendChild(lab);
        if(seq[curIdx] && seq[curIdx].relPath===c.relPath){ wrap.classList.add('on'); }
        wrap.appendChild(row);
      }
      parent.appendChild(wrap);
    });
  }

  var side=document.createElement('aside'); side.className='f2m-side';
  var head=document.createElement('div'); head.className='f2m-head';
  var h1=document.createElement('h1'); h1.textContent=NAV.siteTitle; h1.title='回到首页';
  h1.addEventListener('click',function(){ navigate(base); });
  var collapseBtn=document.createElement('button'); collapseBtn.className='f2m-collapse'; collapseBtn.textContent='«'; collapseBtn.title='收起侧栏 (⌘B)';
  collapseBtn.addEventListener('click',function(){ toggleSide(); });
  head.appendChild(h1); head.appendChild(collapseBtn);
  side.appendChild(head);
  var treeEl=document.createElement('div'); treeEl.className='f2m-tree';
  side.appendChild(treeEl);
  buildTree(NAV.tree, treeEl);
  root.appendChild(side);

  // 侧栏收起后的展开条
  var reveal=document.createElement('div'); reveal.className='f2m-reveal'; reveal.textContent='☰'; reveal.title='展开侧栏 (⌘B)';
  reveal.addEventListener('click',function(){ toggleSide(); });
  root.appendChild(reveal);

  var top=document.createElement('div'); top.className='f2m-top';
  var menuBtn=document.createElement('button'); menuBtn.className='f2m-menu'; menuBtn.textContent='目录'; menuBtn.setAttribute('aria-expanded','false'); menuBtn.setAttribute('aria-controls','course-directory');
  side.id='course-directory'; side.setAttribute('aria-label','课程目录');
  var homeLink=document.createElement('a'); homeLink.className='f2m-home'; homeLink.href=base; homeLink.textContent='首页';
  var backdrop=document.createElement('button'); backdrop.className='f2m-backdrop'; backdrop.tabIndex=-1; backdrop.setAttribute('aria-label','关闭课程目录'); root.appendChild(backdrop);
  var prev=document.createElement('button'); prev.textContent='← 上一页';
  var next=document.createElement('button'); next.textContent='下一页 →';
  var cur=document.createElement('span'); cur.className='f2m-cur';
  cur.textContent = curIdx>=0 ? seq[curIdx].title : NAV.siteTitle;
  var pbtn=document.createElement('button'); pbtn.textContent='⌘P'; pbtn.title='命令面板 (⌘P)';
  var fbtn=document.createElement('button'); fbtn.textContent='⤢'; fbtn.title='全屏 (⌘\\)';
  var hbtn=document.createElement('button'); hbtn.textContent='?'; hbtn.title='快捷键帮助 (?)';
  fbtn.className='f2m-fullscreen'; hbtn.className='f2m-shortcuts';
  pbtn.setAttribute('aria-label','搜索课程');
  top.appendChild(menuBtn); top.appendChild(homeLink);
  top.appendChild(prev); top.appendChild(next); top.appendChild(cur); top.appendChild(pbtn); top.appendChild(fbtn); top.appendChild(hbtn);
  root.appendChild(top);
  prev.disabled = !prevTarget();
  next.disabled = !nextTarget();
  prev.addEventListener('click',goPrev);
  next.addEventListener('click',goNext);

  var mask=document.createElement('div'); mask.className='f2m-mask';
  var pal=document.createElement('div'); pal.className='f2m-palette';
  var inp=document.createElement('input'); inp.setAttribute('placeholder','搜索页面，或输入 > 执行命令');
  var res=document.createElement('div'); res.className='f2m-results';
  pal.appendChild(inp); pal.appendChild(res); mask.appendChild(pal); root.appendChild(mask);

  var COMMANDS=[
    {t:'> 回到首页', run:function(){navigate(base);}},
    {t:'> 切换侧栏', run:toggleSide},
    {t:'> 切换全屏', run:toggleFull},
    {t:'> 上一页', run:goPrev},
    {t:'> 下一页', run:goNext}
  ];
  var sel=0, items=[];
  function renderResults(q){
    res.innerHTML=''; items=[]; sel=0;
    var list;
    if(q.charAt(0)==='>'){
      var qq=q.slice(1).trim();
      list=COMMANDS.filter(function(c){return !qq||c.t.indexOf(qq)>=0;}).map(function(c){return {title:c.t,path:'命令',run:c.run};});
    } else {
      var ql=q.toLowerCase();
      list=seq.filter(function(e){return !ql||e.title.toLowerCase().indexOf(ql)>=0||e.relPath.toLowerCase().indexOf(ql)>=0;})
        .map(function(e){return {title:e.title,path:e.relPath,run:function(){navigate(e.url);}};});
    }
    list.slice(0,50).forEach(function(it,i){
      var d=document.createElement('div'); d.className='f2m-item'+(i===0?' sel':'');
      var a=document.createElement('span'); a.textContent=it.title;
      var b=document.createElement('span'); b.className='p'; b.textContent=it.path;
      d.appendChild(a); d.appendChild(b);
      d.addEventListener('click',it.run);
      res.appendChild(d); items.push({el:d,run:it.run});
    });
  }
  function openPalette(){ mask.classList.add('show'); inp.value=''; renderResults(''); inp.focus(); }
  function closePalette(){ mask.classList.remove('show'); }
  function move(d){ if(!items.length)return; items[sel].el.classList.remove('sel'); sel=(sel+d+items.length)%items.length; items[sel].el.classList.add('sel'); items[sel].el.scrollIntoView({block:'nearest'}); }
  inp.addEventListener('input',function(){renderResults(inp.value);});
  inp.addEventListener('keydown',function(e){
    if(e.key==='ArrowDown'){e.preventDefault();move(1);}
    else if(e.key==='ArrowUp'){e.preventDefault();move(-1);}
    else if(e.key==='Enter'){e.preventDefault(); if(items[sel]) items[sel].run();}
    else if(e.key==='Escape'){closePalette();}
  });
  mask.addEventListener('click',function(e){ if(e.target===mask) closePalette(); });
  pbtn.addEventListener('click',openPalette);

  // ---- 快捷键帮助悬浮窗 ----
  var SHORTCUTS=[
    {desc:'命令面板（搜索 / 命令）', keys:['⌘','P']},
    {desc:'收起 / 展开侧栏', keys:['⌘','B']},
    {desc:'全屏模式', keys:['⌘','\\']},
    {desc:'上一页', keys:['←']},
    {desc:'下一页', keys:['→']},
    {desc:'本帮助窗', keys:['?']},
    {desc:'关闭弹窗 / 退出全屏', keys:['Esc']}
  ];
  var hmask=document.createElement('div'); hmask.className='f2m-mask';
  var help=document.createElement('div'); help.className='f2m-help';
  var hh=document.createElement('div'); hh.className='f2m-help-h';
  var ht=document.createElement('span'); ht.textContent='键盘快捷键';
  var hx=document.createElement('span'); hx.className='x'; hx.textContent='×';
  hh.appendChild(ht); hh.appendChild(hx);
  var hlist=document.createElement('div'); hlist.className='f2m-help-list';
  SHORTCUTS.forEach(function(s){
    var r=document.createElement('div'); r.className='f2m-kbd-row';
    var d=document.createElement('span'); d.className='desc'; d.textContent=s.desc;
    var k=document.createElement('span'); k.className='keys';
    s.keys.forEach(function(key){ var kb=document.createElement('kbd'); kb.textContent=key; k.appendChild(kb); });
    r.appendChild(d); r.appendChild(k); hlist.appendChild(r);
  });
  help.appendChild(hh); help.appendChild(hlist); hmask.appendChild(help); root.appendChild(hmask);
  function openHelp(){ hmask.classList.add('show'); }
  function closeHelp(){ hmask.classList.remove('show'); }
  function toggleHelp(){ hmask.classList.contains('show')?closeHelp():openHelp(); }
  hx.addEventListener('click',closeHelp);
  hmask.addEventListener('click',function(e){ if(e.target===hmask) closeHelp(); });
  hbtn.addEventListener('click',toggleHelp);

  // 右下角常驻 ? 按钮
  var fab=document.createElement('button'); fab.className='f2m-fab'; fab.textContent='?'; fab.title='快捷键帮助 (?)';
  fab.addEventListener('click',toggleHelp);
  root.appendChild(fab);

  var hint=document.createElement('div'); hint.className='f2m-hint'; root.appendChild(hint);
  function flash(msg){ hint.textContent=msg; hint.classList.add('show'); setTimeout(function(){hint.classList.remove('show');},1400); }
  var sideHidden=false, full=false;
  sideHidden = readSide();
  full = readFull();
  function applyLayout(){
    if(mobile.matches){
      side.classList.toggle('hid', !mobileOpen);
      side.inert=!mobileOpen;
      top.classList.add('full'); top.style.display='flex';
      reveal.classList.remove('show');
      backdrop.classList.toggle('show',mobileOpen);
      menuBtn.setAttribute('aria-expanded',String(mobileOpen));
      collapseBtn.textContent='×'; collapseBtn.title='关闭目录';
      pbtn.textContent='搜索';
      prev.textContent='上一课'; next.textContent='下一课';
      de.style.paddingLeft='0'; de.style.paddingTop='calc(56px + env(safe-area-inset-top))';
      document.body.style.overflowY=mobileOpen?'hidden':'';
      return;
    }
    side.inert=sideHidden||full;
    backdrop.classList.remove('show'); document.body.style.overflowY='';
    collapseBtn.textContent='«'; collapseBtn.title='收起侧栏 (⌘B)'; pbtn.textContent='⌘P';
    prev.textContent='← 上一页'; next.textContent='下一页 →';
    side.classList.toggle('hid', sideHidden||full);
    top.classList.toggle('full', sideHidden||full);
    top.style.display = full?'none':'flex';
    reveal.classList.toggle('show', sideHidden && !full);
    de.style.paddingLeft = (sideHidden||full)?'0':'280px';
    de.style.paddingTop = full?'0':'48px';
  }
  function toggleSide(){
    if(mobile.matches){mobileOpen=!mobileOpen;applyLayout();(mobileOpen?collapseBtn:menuBtn).focus();return;}
    sideHidden=!sideHidden; writeSide(sideHidden); applyLayout();
  }
  menuBtn.addEventListener('click',toggleSide);
  backdrop.addEventListener('click',toggleSide);
  mobile.addEventListener('change',function(){mobileOpen=false;applyLayout();});
  side.addEventListener('keydown',function(e){
    if(!mobile.matches||!mobileOpen||e.key!=='Tab')return;
    var controls=Array.from(side.querySelectorAll('button,a[href]'));
    var first=controls[0],last=controls[controls.length-1];
    if(e.shiftKey&&sd.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&sd.activeElement===last){e.preventDefault();first.focus();}
  });
  function toggleFull(){ full=!full; writeFull(full); applyLayout(); flash(full?'全屏模式（Esc 退出）':'退出全屏'); }
  fbtn.addEventListener('click',toggleFull);

  function paletteOpen(){ return mask.classList.contains('show'); }
  function helpOpen(){ return hmask.classList.contains('show'); }
  document.addEventListener('keydown',function(e){
    var mod=e.metaKey||e.ctrlKey;
    if(mod && e.key==='p'){ e.preventDefault(); openPalette(); }
    else if(mod && e.key==='b'){ e.preventDefault(); toggleSide(); }
    else if(mod && e.key==='\\'){ e.preventDefault(); toggleFull(); }
    else if(!mod && e.key==='?'){ e.preventDefault(); toggleHelp(); }
    else if(e.key==='Escape'){ if(helpOpen())closeHelp(); else if(paletteOpen())closePalette(); else if(mobileOpen)toggleSide(); else if(full)toggleFull(); }
    else if(e.key==='ArrowLeft' && !paletteOpen() && !helpOpen()){ goPrev(); }
    else if(e.key==='ArrowRight' && !paletteOpen() && !helpOpen()){ goNext(); }
  });

  // 恢复持久化的侧栏 / 全屏状态（无过渡闪烁）
  side.style.transition='none'; top.style.transition='none';
  applyLayout();
  requestAnimationFrame(function(){ side.style.transition=''; top.style.transition=''; });

  // 首次访问：闪一下提示（仅 localStorage 可用时记忆，避免 file:// 下每页重闪）
  if(storageOK && !mobile.matches){
    try{
      if(!localStorage.getItem('f2m-hinted')){
        flash('按 ? 查看快捷键');
        localStorage.setItem('f2m-hinted','1');
      }
    }catch(_){}
  }
})();
