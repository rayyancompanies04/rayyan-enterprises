/* ==========================================================================
   Rayyan Enterprises — shared behaviour
   Runs on every page. No frameworks, no build step.
   ========================================================================== */
(function(){
"use strict";
var doc = document;

/* ---------- scroll reveal ---------- */
var reveal = [].slice.call(doc.querySelectorAll('.rv'));
function settle(el){
  // the inline delay only staggers the entrance; clear it so hover
  // transitions afterwards are not delayed
  var done = function(){ el.style.transitionDelay = ''; };
  el.addEventListener('transitionend', done, {once:true});
  setTimeout(done, 1100); // fallback (reduced-motion: no transition ever ends)
}
if('IntersectionObserver' in window){
  var io = new IntersectionObserver(function(entries){
    var k = 0; // stagger only the items that arrive together
    entries.forEach(function(en){
      if(!en.isIntersecting) return;
      var el = en.target;
      el.style.transitionDelay = Math.min(k++, 6) * 60 + 'ms';
      el.classList.add('in');
      io.unobserve(el);
      settle(el);
    });
  }, {threshold:.1, rootMargin:'0px 0px -40px 0px'});
  reveal.forEach(function(el){ io.observe(el); });
}else{
  reveal.forEach(function(el){ el.classList.add('in'); });
}

/* ---------- mega menu (desktop hover / keyboard) ---------- */
var svcItem = doc.getElementById('svcItem');
if(svcItem){
  var svcLink = svcItem.querySelector('.nlink'), closeT;
  svcLink.setAttribute('aria-haspopup', 'true');
  svcLink.setAttribute('aria-expanded', 'false');
  var setMega = function(open){
    svcItem.classList.toggle('open', open);
    svcLink.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  var openMega = function(){ clearTimeout(closeT); setMega(true); };
  var shutMega = function(){ closeT = setTimeout(function(){ setMega(false); }, 140); };
  svcItem.addEventListener('mouseenter', openMega);
  svcItem.addEventListener('mouseleave', shutMega);
  svcItem.addEventListener('focusin', openMega);
  svcItem.addEventListener('focusout', shutMega);
}

/* ---------- mobile sheet ---------- */
var sheet = doc.getElementById('sheet');
var burger = doc.getElementById('burger');
var mtog = doc.getElementById('mtog');
var msub = doc.getElementById('msub');
var hdr = doc.getElementById('hdr');

function setSheet(on){
  if(!sheet || !burger) return;
  if(on){
    // sit directly under the header wherever the page is scrolled to
    var top = hdr ? Math.round(hdr.getBoundingClientRect().bottom) : 108;
    sheet.style.setProperty('--sheet-top', top + 'px');
  }
  sheet.classList.toggle('on', on);
  burger.classList.toggle('on', on);
  burger.setAttribute('aria-expanded', on ? 'true' : 'false');
  doc.body.style.overflow = on ? 'hidden' : '';
}
if(burger && sheet){
  burger.addEventListener('click', function(){ setSheet(!sheet.classList.contains('on')); });
  sheet.addEventListener('click', function(e){ if(e.target.closest('a')) setSheet(false); });
}
if(mtog && msub){
  mtog.addEventListener('click', function(){
    var open = msub.classList.toggle('on');
    mtog.classList.toggle('on', open);
    mtog.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}
doc.addEventListener('keydown', function(e){
  if(e.key === 'Escape'){ setSheet(false); if(svcItem) setMega(false); }
});
window.addEventListener('resize', function(){ if(window.innerWidth > 1000) setSheet(false); });
window.addEventListener('pageshow', function(e){ if(e.persisted) setSheet(false); }); // back-button cache

/* ---------- header chrome: stuck state, progress bar, back-to-top ---------- */
var totop = doc.getElementById('totop');
var prog = doc.getElementById('prog');
var ticking = false;

function onScroll(){
  ticking = false;
  var y = window.scrollY;
  if(hdr) hdr.classList.toggle('stuck', y > 10);
  if(totop) totop.classList.toggle('on', y > 700);
  if(prog){
    var h = doc.documentElement.scrollHeight - window.innerHeight;
    prog.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  }
}
window.addEventListener('scroll', function(){
  if(!ticking){ ticking = true; requestAnimationFrame(onScroll); }
}, {passive:true});
onScroll();
if(totop){ totop.addEventListener('click', function(){ window.scrollTo({top:0, behavior:'smooth'}); }); }

/* ---------- footer year ---------- */
var yr = doc.getElementById('yr');
if(yr) yr.textContent = new Date().getFullYear();

/* ---------- contact form ----------
   Delivery order:
   1. If <form data-endpoint="https://..."> is set (Formspree, Web3Forms, your own
      API...) the enquiry is POSTed there as JSON.
   2. Otherwise it falls back to opening the visitor's e-mail app (mailto:).
   The "Send on WhatsApp" button always works, using data-wa on the form. */
var form = doc.getElementById('form');
if(form){
  var note = doc.getElementById('note');
  var submitBtn = form.querySelector('button[type="submit"]');
  var waBtn = doc.getElementById('wa');
  var MAIL = 'rayyanenterprises04@gmail.com';
  var $ = function(id){ return doc.getElementById(id); };

  function flag(el, isBad){
    el.closest('.f').classList.toggle('bad', isBad);
    el.setAttribute('aria-invalid', isBad ? 'true' : 'false');
    return !isBad;
  }
  function say(msg, isErr){
    if(!note) return;
    note.textContent = msg;
    note.classList.add('on');
    note.classList.toggle('err', !!isErr);
  }
  function collect(){
    var n = $('n'),  p = $('p'), sv = $('sv');
    var ok = true;
    ok = flag(n,  n.value.trim().length < 2) && ok;
    ok = flag(p,  p.value.replace(/\D/g, '').length < 8) && ok;
    ok = flag(sv, sv.value === '') && ok;
    if(!ok){
      var f = form.querySelector('.f.bad input,.f.bad select,.f.bad textarea');
      if(f) f.focus();
      return null;
    }
    return {name:n.value.trim(), company:$('c').value.trim(), email:e.value.trim(),
            phone:p.value.trim(), service:sv.value, message:m.value.trim()};
  }
  function asText(d){
    return 'Name: ' + d.name + '\nCompany: ' + (d.company || '-') + '\nEmail: ' + d.email +
           '\nPhone: ' + d.phone + '\nService: ' + d.service + '\n\nScope and location:\n' + d.message;
  }

  form.addEventListener('submit', function(ev){
    ev.preventDefault();
    if(form.elements._gotcha && form.elements._gotcha.value) return; // bot trap
    var d = collect(); if(!d) return;
    var endpoint = (form.getAttribute('data-endpoint') || '').trim();

    if(endpoint){
      submitBtn.disabled = true;
      d._subject = 'Website enquiry — ' + d.service;
      fetch(endpoint, {method:'POST', headers:{'Content-Type':'application/json', 'Accept':'application/json'}, body:JSON.stringify(d)})
        .then(function(r){ if(!r.ok) throw new Error(r.status); form.reset(); say('Thank you — your enquiry has been sent. We normally reply within one working day.'); })
        .catch(function(){ say('Your enquiry could not be sent. Please call or WhatsApp us, or write to ' + MAIL + '.', true); })
        .then(function(){ submitBtn.disabled = false; });
    }else{
      say('Your enquiry has been prepared and your email application should now open. If it does not, write to us directly at ' + MAIL + '.');
      window.location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Enquiry — ' + d.service) + '&body=' + encodeURIComponent(asText(d));
      form.reset();
    }
  });

   if(waBtn){
    waBtn.addEventListener('click', function(){
      var d = collect(); if(!d) return;
      var num = (form.getAttribute('data-wa') || '').replace(/\D/g, '').replace(/^0+/, '');
      if(num.length === 10) num = '91' + num;          // 10-digit Indian mobile: add country code
      if(num.length < 11 || /^919{10}$/.test(num)){    // empty or still the placeholder
        say('WhatsApp is not set up yet. Please call or email us instead.', true);
        return;
      }
      window.open('https://wa.me/' + num + '?text=' + encodeURIComponent('Enquiry — ' + d.service + '\n\n' + asText(d)), '_blank', 'noopener');
    });
  }
  [].forEach.call(form.querySelectorAll('input,select,textarea'), function(el){
    el.addEventListener('input', function(){ var f = el.closest('.f'); if(f) f.classList.remove('bad'); el.setAttribute('aria-invalid', 'false'); });
  });
}

})();
