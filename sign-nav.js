(function(){
 if(location.pathname.indexOf('/check-in')===0)return;
 function add(){
  var parents=[];
  document.querySelectorAll('header a').forEach(function(a){var h=a.getAttribute('href')||'';if((h==='/contact'||h==='/contact/')&&a.parentElement&&parents.indexOf(a.parentElement)<0)parents.push(a.parentElement)});
  parents.forEach(function(p){if(p.querySelector('[data-jsm-checkin]'))return;var ref=p.querySelector('a[href="/contact"]')||p.querySelector('a'),a=document.createElement('a');a.href='/check-in/';a.textContent='Sign documents';a.setAttribute('data-jsm-checkin','1');if(ref)a.className=ref.className;p.appendChild(a)});
  return parents.length>0;
 }
 if(add())return;
 var n=0,t=setInterval(function(){if(add()||++n>50)clearInterval(t)},200);
})();
