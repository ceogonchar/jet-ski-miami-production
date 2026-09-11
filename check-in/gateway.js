'use strict';
(async()=>{
 const hash=new URLSearchParams(location.hash.slice(1)),token=hash.get('invite'),group=hash.get('join'),booking=hash.get('booking'),team=location.hash==='#team';
 if(token||group||booking||team)history.replaceState(null,'',location.pathname);
 try{
  const r=await fetch('backend.json?t='+Date.now(),{cache:'no-store',credentials:'omit'});if(!r.ok)throw Error('route');
  const c=await r.json(),u=new URL(c.origin);
  if(u.protocol!=='https:'||u.username||u.password||u.port||u.pathname!=='/'||u.search||u.hash||!(/^[a-z0-9-]+\.trycloudflare\.com$/.test(u.hostname)||u.hostname==='sign.jet-ski-miami.com'))throw Error('origin');
  let route='/check-in';
  if(token||group){const t=token||group;if(!/^[A-Za-z0-9_-]{32,100}$/.test(t))throw Error('invite');route=(token?'/s/':'/join/')+encodeURIComponent(t)}
  else if(team)route='/staff';
  else if(booking)route+='?booking='+encodeURIComponent(booking.slice(0,100));
  location.replace(u.origin+route);
 }catch(e){document.querySelector('#status').textContent='Check-in is temporarily unavailable. Please try again or contact our team at goncharboats@gmail.com.';}
})();
