'use strict';
(async()=>{
 const hash=new URLSearchParams(location.hash.slice(1)),token=hash.get('invite'),team=location.hash==='#team';
 // Invitation secrets stay in the fragment, out of static hosting logs and analytics.
 if(token||team)history.replaceState(null,'',location.pathname);
 try{
  const r=await fetch('backend.json?t='+Date.now(),{cache:'no-store',credentials:'omit'});if(!r.ok)throw Error('route');
  const c=await r.json(),u=new URL(c.origin);
  if(u.protocol!=='https:'||u.username||u.password||u.port||u.pathname!=='/'||u.search||u.hash||!(/^[a-z0-9-]+\.trycloudflare\.com$/.test(u.hostname)||u.hostname==='sign.jet-ski-miami.com'))throw Error('origin');
  if(token){if(!/^[A-Za-z0-9_-]{32,100}$/.test(token))throw Error('invite');location.replace(u.origin+'/s/'+encodeURIComponent(token));return}
  if(team){location.replace(u.origin+'/staff');return}
  const a=document.querySelector('#preview');a.href=u.origin+'/preview';a.textContent='Try the complete booking journey →';a.setAttribute('aria-disabled','false');a.rel='noreferrer';
  const t=document.querySelector('#team');t.href=u.origin+'/staff';t.setAttribute('aria-disabled','false');t.rel='noreferrer';
 }catch(e){document.querySelector('#status').textContent='The new check-in is temporarily unavailable. Please try again or contact goncharboats@gmail.com. Existing customer check-in remains with the team.';document.querySelector('#preview').textContent='Check-in connection unavailable';}
})();
