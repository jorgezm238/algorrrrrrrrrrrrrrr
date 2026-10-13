/* tests_temas.js — Tests A/B/C/D por tema (100 preguntas por tema, sacadas de los 3 PDF).
 * Requiere cargar antes preguntas_temas.js (define window.PREGUNTAS_TEMAS).
 * No modifica script.js: añade su propio botón al menú y su propia sección.
 *
 *  - Tema 1 / Tema 2 / Tema 3 / Todos los temas juntos (300)
 *  - Orden aleatorio de preguntas y de opciones cada vez que empiezas
 *  - Bloques de 20 preguntas (o todas en una sola página)
 *  - Corrección al hacer clic; si fallas, te dice la solución y la explicación
 */
(function () {
  'use strict';

  var DATA = window.PREGUNTAS_TEMAS;
  if (!DATA) { console.warn('tests_temas.js: falta preguntas_temas.js'); return; }

  var TEMAS = {
    1: 'Tema 1 · Introducción a la algoritmia',
    2: 'Tema 2 · T(n) y O(·): contar y simplificar',
    3: 'Tema 3 · Optimización algorítmica'
  };
  var BLOQUE = 20;
  var LETRAS = ['A', 'B', 'C', 'D'];

  // ---------- utilidades ----------
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function barajar(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  // texto con bloques de código entre § §
  function formatea(txt) {
    var partes = String(txt).split('§');
    var html = '';
    for (var i = 0; i < partes.length; i++) {
      if (i % 2 === 1) html += '<pre class="tt-code">' + esc(partes[i]) + '</pre>';
      else html += '<span class="tt-txt">' + esc(partes[i]) + '</span>';
    }
    return html;
  }

  // ---------- estilos ----------
  var css = [
    '#temas .tt-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px;margin:14px 0}',
    '#temas .tt-card{all:unset;box-sizing:border-box;display:block;cursor:pointer;padding:16px;border-radius:12px;',
    ' border:1px solid rgba(127,127,127,.4);background:rgba(127,127,127,.10);color:inherit;line-height:1.35}',
    '#temas .tt-card:hover{background:rgba(127,127,127,.2)}',
    '#temas .tt-card.sel{border-color:#e0a93b;box-shadow:0 0 0 2px rgba(224,169,59,.45)}',
    '#temas .tt-card b{display:block;font-size:1.05em;margin-bottom:4px}',
    '#temas .tt-card small{opacity:.75}',
    '#temas .tt-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:10px 0}',
    '#temas .tt-btn{all:unset;box-sizing:border-box;cursor:pointer;padding:9px 16px;border-radius:9px;font-weight:600;',
    ' background:#e0a93b;color:#1a1a1a;border:1px solid transparent}',
    '#temas .tt-btn:hover{filter:brightness(1.08)}',
    '#temas .tt-btn.sec{background:rgba(127,127,127,.18);color:inherit;border-color:rgba(127,127,127,.4)}',
    '#temas .tt-btn[disabled]{opacity:.4;cursor:default}',
    '#temas .tt-bar{position:sticky;top:0;z-index:5;padding:10px 12px;margin:0 0 14px;border-radius:10px;',
    ' border:1px solid rgba(127,127,127,.4);backdrop-filter:blur(8px);background:rgba(127,127,127,.18)}',
    '#temas .tt-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}',
    '#temas .tt-chip{all:unset;box-sizing:border-box;cursor:pointer;min-width:34px;text-align:center;padding:4px 9px;',
    ' border-radius:8px;border:1px solid rgba(127,127,127,.45);font-size:.9em}',
    '#temas .tt-chip.on{background:#e0a93b;color:#1a1a1a;border-color:#e0a93b;font-weight:700}',
    '#temas .tt-chip.ok{border-color:#2ea05a}',
    '#temas .tt-q{padding:14px 16px;margin:0 0 14px;border-radius:12px;border:1px solid rgba(127,127,127,.4);',
    ' background:rgba(127,127,127,.08)}',
    '#temas .tt-qh{display:flex;gap:8px;align-items:center;margin-bottom:8px;font-size:.85em;opacity:.8}',
    '#temas .tt-badge{padding:2px 8px;border-radius:999px;border:1px solid rgba(127,127,127,.5)}',
    '#temas .tt-txt{white-space:pre-wrap;display:block;font-weight:600;line-height:1.4}',
    '#temas .tt-code{margin:8px 0;padding:10px 12px;border-radius:8px;overflow-x:auto;background:rgba(0,0,0,.35);',
    ' color:#e8eefc;font:13px/1.45 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:pre}',
    '#temas .tt-opts{display:grid;gap:8px;margin-top:10px}',
    '#temas .tt-opt{all:unset;box-sizing:border-box;display:flex;gap:10px;width:100%;cursor:pointer;padding:10px 12px;',
    ' border-radius:9px;border:1px solid rgba(127,127,127,.4);background:rgba(127,127,127,.10);color:inherit;line-height:1.35}',
    '#temas .tt-opt:hover{background:rgba(127,127,127,.22)}',
    '#temas .tt-opt .l{font-weight:700;min-width:1.4em}',
    '#temas .tt-q.hecha .tt-opt{cursor:default}',
    '#temas .tt-q.hecha .tt-opt:hover{background:rgba(127,127,127,.10)}',
    '#temas .tt-opt.bien{background:rgba(46,160,90,.28)!important;border-color:#2ea05a}',
    '#temas .tt-opt.mal{background:rgba(220,70,70,.28)!important;border-color:#dc4646}',
    '#temas .tt-fb{margin-top:10px;padding:10px 12px;border-radius:9px;line-height:1.45;white-space:pre-wrap}',
    '#temas .tt-fb.bien{background:rgba(46,160,90,.18);border:1px solid #2ea05a}',
    '#temas .tt-fb.mal{background:rgba(220,70,70,.16);border:1px solid #dc4646}',
    '#temas .tt-res{padding:16px;border-radius:12px;border:1px solid #e0a93b;background:rgba(224,169,59,.12);margin:16px 0}'
  ].join('\n');
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  // ---------- estructura en la página ----------
  var main = document.querySelector('main') || document.body;
  var nav = document.querySelector('#menu nav');
  var sec = document.createElement('section');
  sec.id = 'temas';
  sec.className = 'vista';
  sec.hidden = true;
  main.appendChild(sec);

  var btn = document.createElement('button');
  btn.textContent = '🎯 Tests por tema (A/B/C/D)';
  btn.setAttribute('data-v', 'temas');
  if (nav) {
    var vf = nav.querySelector('button[data-v="vf"]');
    if (vf && vf.nextSibling) nav.insertBefore(btn, vf.nextSibling); else nav.appendChild(btn);
  }

  function mostrar() {
    var todas = document.querySelectorAll('main .vista');
    for (var i = 0; i < todas.length; i++) todas[i].hidden = (todas[i] !== sec);
    if (nav) {
      var bs = nav.querySelectorAll('button');
      for (var k = 0; k < bs.length; k++) bs[k].classList.toggle('on', bs[k] === btn);
    }
    window.scrollTo(0, 0);
  }
  btn.addEventListener('click', function () { mostrar(); });
  if (nav) {
    nav.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button') : null;
      if (b && b !== btn) sec.hidden = true;
    }, true);
  }

  // ---------- estado ----------
  var S = {
    modo: '1',          // '1' | '2' | '3' | 'todos'
    unaPagina: false,
    preguntas: [],      // [{tema, q, opciones[], correcta(idx), exp, resp(null|idx)}]
    bloque: 0,
    enCurso: false
  };

  function construir(modo) {
    var temas = modo === 'todos' ? [1, 2, 3] : [parseInt(modo, 10)];
    var lista = [];
    temas.forEach(function (t) {
      (DATA[t] || []).forEach(function (p) {
        var ops = barajar([
          { txt: p[1], ok: true }, { txt: p[2], ok: false },
          { txt: p[3], ok: false }, { txt: p[4], ok: false }
        ]);
        var idx = 0;
        ops.forEach(function (o, i) { if (o.ok) idx = i; });
        lista.push({ tema: t, q: p[0], opciones: ops.map(function (o) { return o.txt; }), correcta: idx, exp: p[5], resp: null });
      });
    });
    return barajar(lista);
  }

  function nBloques() { return Math.ceil(S.preguntas.length / BLOQUE); }

  function stats(desde, hasta) {
    var r = 0, ok = 0;
    for (var i = desde; i < hasta; i++) {
      if (S.preguntas[i].resp !== null) { r++; if (S.preguntas[i].resp === S.preguntas[i].correcta) ok++; }
    }
    return { respondidas: r, aciertos: ok, total: hasta - desde };
  }

  // ---------- vistas ----------
  function vistaMenu() {
    S.enCurso = false;
    var total = (DATA[1] || []).length + (DATA[2] || []).length + (DATA[3] || []).length;
    var h = '<h2>Tests por tema</h2>' +
      '<p>Preguntas tipo test A/B/C/D basadas <b>solo en los 3 PDF de clase</b>. Cada vez que empiezas se barajan las preguntas y las opciones. ' +
      'Haz clic en una respuesta y se corrige al momento; si fallas, verás la solución y la explicación. Se hacen en bloques de ' + BLOQUE + '.</p>' +
      '<div class="tt-grid">';
    [1, 2, 3].forEach(function (t) {
      h += '<button class="tt-card' + (S.modo === String(t) ? ' sel' : '') + '" data-modo="' + t + '"><b>' + esc(TEMAS[t]) + '</b>' +
        '<small>' + (DATA[t] || []).length + ' preguntas · ' + Math.ceil((DATA[t] || []).length / BLOQUE) + ' bloques de ' + BLOQUE + '</small></button>';
    });
    h += '<button class="tt-card' + (S.modo === 'todos' ? ' sel' : '') + '" data-modo="todos"><b>🔀 Todos los temas juntos</b>' +
      '<small>' + total + ' preguntas mezcladas · ' + Math.ceil(total / BLOQUE) + ' bloques de ' + BLOQUE + '</small></button>';
    h += '</div>' +
      '<div class="tt-row"><label><input type="checkbox" id="ttUna"' + (S.unaPagina ? ' checked' : '') + '> Mostrar todas las preguntas en una sola página (sin dividir en bloques)</label></div>' +
      '<div class="tt-row"><button class="tt-btn" id="ttStart">▶ Empezar</button></div>';
    sec.innerHTML = h;

    sec.querySelectorAll('.tt-card').forEach(function (c) {
      c.addEventListener('click', function () { S.modo = c.getAttribute('data-modo'); vistaMenu(); });
    });
    sec.querySelector('#ttUna').addEventListener('change', function (e) { S.unaPagina = e.target.checked; });
    sec.querySelector('#ttStart').addEventListener('click', function () {
      S.preguntas = construir(S.modo);
      S.bloque = 0;
      S.enCurso = true;
      vistaTest();
    });
  }

  function rango() {
    if (S.unaPagina) return [0, S.preguntas.length];
    return [S.bloque * BLOQUE, Math.min((S.bloque + 1) * BLOQUE, S.preguntas.length)];
  }

  function vistaTest() {
    var r = rango(), desde = r[0], hasta = r[1];
    var titulo = S.modo === 'todos' ? '🔀 Todos los temas juntos' : TEMAS[S.modo];
    var total = stats(0, S.preguntas.length);
    var h = '<div class="tt-bar">' +
      '<div class="tt-row" style="margin:0;justify-content:space-between"><b>' + esc(titulo) + '</b>' +
      '<span id="ttMarc">✅ ' + total.aciertos + ' · ❌ ' + (total.respondidas - total.aciertos) + ' · respondidas ' + total.respondidas + '/' + total.total + '</span></div>';
    if (!S.unaPagina) {
      h += '<div class="tt-chips">';
      for (var b = 0; b < nBloques(); b++) {
        var bs = stats(b * BLOQUE, Math.min((b + 1) * BLOQUE, S.preguntas.length));
        h += '<button class="tt-chip' + (b === S.bloque ? ' on' : '') + (bs.respondidas === bs.total ? ' ok' : '') + '" data-b="' + b + '">' + (b + 1) + '</button>';
      }
      h += '</div>';
    }
    h += '</div>';

    h += '<p style="opacity:.8;margin:0 0 12px">' + (S.unaPagina
      ? 'Todas las preguntas (' + S.preguntas.length + ') en una sola página.'
      : 'Bloque ' + (S.bloque + 1) + ' de ' + nBloques() + ' · preguntas ' + (desde + 1) + '–' + hasta) + '</p>';

    for (var i = desde; i < hasta; i++) h += htmlPregunta(i);

    h += '<div id="ttResBloque"></div>' +
      '<div class="tt-row">' +
      (!S.unaPagina ? '<button class="tt-btn sec" id="ttPrev"' + (S.bloque === 0 ? ' disabled' : '') + '>← Bloque anterior</button>' +
        '<button class="tt-btn" id="ttNext"' + (S.bloque >= nBloques() - 1 ? ' disabled' : '') + '>Siguiente bloque →</button>' : '') +
      '<button class="tt-btn sec" id="ttBarajar">🔀 Barajar de nuevo</button>' +
      '<button class="tt-btn sec" id="ttMenu">☰ Cambiar de tema</button></div>';
    sec.innerHTML = h;

    // eventos
    sec.querySelectorAll('.tt-opt').forEach(function (o) {
      o.addEventListener('click', function () {
        responder(parseInt(o.getAttribute('data-q'), 10), parseInt(o.getAttribute('data-o'), 10));
      });
    });
    sec.querySelectorAll('.tt-chip').forEach(function (c) {
      c.addEventListener('click', function () { S.bloque = parseInt(c.getAttribute('data-b'), 10); vistaTest(); window.scrollTo(0, 0); });
    });
    var nx = sec.querySelector('#ttNext'), pv = sec.querySelector('#ttPrev');
    if (nx) nx.addEventListener('click', function () { S.bloque++; vistaTest(); window.scrollTo(0, 0); });
    if (pv) pv.addEventListener('click', function () { S.bloque--; vistaTest(); window.scrollTo(0, 0); });
    sec.querySelector('#ttBarajar').addEventListener('click', function () {
      S.preguntas = construir(S.modo); S.bloque = 0; vistaTest(); window.scrollTo(0, 0);
    });
    sec.querySelector('#ttMenu').addEventListener('click', function () { vistaMenu(); window.scrollTo(0, 0); });
    resumenBloque();
  }

  function htmlPregunta(i) {
    var p = S.preguntas[i];
    var h = '<div class="tt-q' + (p.resp !== null ? ' hecha' : '') + '" id="ttq' + i + '">' +
      '<div class="tt-qh"><b>Pregunta ' + (i + 1) + '</b>' +
      (S.modo === 'todos' ? '<span class="tt-badge">Tema ' + p.tema + '</span>' : '') + '</div>' +
      formatea(p.q) + '<div class="tt-opts">';
    for (var o = 0; o < p.opciones.length; o++) {
      var cls = 'tt-opt';
      if (p.resp !== null) {
        if (o === p.correcta) cls += ' bien';
        else if (o === p.resp) cls += ' mal';
      }
      h += '<button class="' + cls + '" data-q="' + i + '" data-o="' + o + '"><span class="l">' + LETRAS[o] + ')</span><span>' + esc(p.opciones[o]) + '</span></button>';
    }
    h += '</div><div class="tt-fbw">' + (p.resp !== null ? htmlFeedback(p) : '') + '</div></div>';
    return h;
  }

  function htmlFeedback(p) {
    if (p.resp === p.correcta) {
      return '<div class="tt-fb bien">✅ <b>¡Correcto!</b>\n' + esc(p.exp) + '</div>';
    }
    return '<div class="tt-fb mal">❌ <b>Incorrecto.</b> La solución es <b>' + LETRAS[p.correcta] + ') ' + esc(p.opciones[p.correcta]) + '</b>\n\n<b>Explicación:</b> ' + esc(p.exp) + '</div>';
  }

  function responder(i, o) {
    var p = S.preguntas[i];
    if (p.resp !== null) return;
    p.resp = o;
    var box = sec.querySelector('#ttq' + i);
    if (box) {
      box.classList.add('hecha');
      var btns = box.querySelectorAll('.tt-opt');
      for (var k = 0; k < btns.length; k++) {
        if (k === p.correcta) btns[k].classList.add('bien');
        else if (k === o) btns[k].classList.add('mal');
      }
      box.querySelector('.tt-fbw').innerHTML = htmlFeedback(p);
    }
    var t = stats(0, S.preguntas.length);
    var m = sec.querySelector('#ttMarc');
    if (m) m.textContent = '✅ ' + t.aciertos + ' · ❌ ' + (t.respondidas - t.aciertos) + ' · respondidas ' + t.respondidas + '/' + t.total;
    var chip = sec.querySelector('.tt-chip[data-b="' + S.bloque + '"]');
    if (chip && !S.unaPagina) {
      var bs = stats(S.bloque * BLOQUE, Math.min((S.bloque + 1) * BLOQUE, S.preguntas.length));
      if (bs.respondidas === bs.total) chip.classList.add('ok');
    }
    resumenBloque();
  }

  function resumenBloque() {
    var r = rango(), s = stats(r[0], r[1]);
    var cont = sec.querySelector('#ttResBloque');
    if (!cont) return;
    if (s.respondidas === s.total) {
      var pct = Math.round(100 * s.aciertos / s.total);
      cont.innerHTML = '<div class="tt-res"><b>' + (S.unaPagina ? 'Resultado final' : 'Resultado del bloque ' + (S.bloque + 1)) +
        ':</b> ' + s.aciertos + ' de ' + s.total + ' correctas (' + pct + ' %)' +
        (pct >= 50 ? ' 🎉' : ' — repasa las explicaciones de las falladas y vuelve a intentarlo 💪') + '</div>';
    } else {
      cont.innerHTML = '';
    }
  }

  vistaMenu();
})();
