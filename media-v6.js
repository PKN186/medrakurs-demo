"use strict";
(() => {
 const section=document.querySelector('#video');
 if(!section)return;
 const video=section.querySelector('video');
 const cover=section.querySelector('.video-cover');
 const status=section.querySelector('#video-status');
 const choices=[...section.querySelectorAll('[data-video-choice]')];
 const films={
  appointment:{src:'clinic-appointment-720.mp4',poster:'video-appointment.webp',title:'Приём офтальмолога',description:'Видео центра о приёме офтальмолога.',duration:'3:00'},
  orthokeratology:{src:'clinic-orthokeratology-720.mp4',poster:'video-orthokeratology.webp',title:'Об ортокератологии',description:'Видео центра об ортокератологии.',duration:'3:02'}
 };
 let selected='appointment',modulePromise=null,attempt=0;
 function setPlaying(){
  document.body.classList.toggle('video-playing',!video.paused&&!video.ended);
  if(typeof scheduleAnnouncement==='function')scheduleAnnouncement();
 }
 function report(message){status.textContent=message;}
 function upgrade(){
  if(!modulePromise){
   modulePromise=import('./video-player-v6.js').then(()=>{
    video.controls=false;
    section.classList.add('video-enhanced');
   }).catch(()=>{
    // Native controls keep playback available if custom elements cannot load.
    video.controls=true;
    report('Доступен стандартный плеер: управление звуком, перемотка и полный экран.');
    modulePromise=null;
   });
  }
  return modulePromise;
 }
 function selectFilm(key){
  selected=key;
  const film=films[key];
  choices.forEach(choice=>{
   const active=choice.dataset.videoChoice===key;
   choice.setAttribute('aria-pressed',String(active));
   choice.querySelector('[data-choice-status]').textContent=active?'Выбрано':'Смотреть';
  });
  section.querySelector('[data-video-title]').textContent=film.title;
  section.querySelector('[data-video-description]').textContent=film.description;
  section.querySelector('[data-video-duration]').textContent=film.duration;
  section.querySelector('.video-cover>img').src=film.poster;
  cover.setAttribute('aria-label',`Смотреть видео «${film.title}», ${film.duration}`);
  video.setAttribute('aria-label',film.title);
  video.poster=film.poster;
 }
 function start(key=selected){
  const ownAttempt=++attempt;
  const switching=key!==selected;
  if(switching)video.pause();
  selectFilm(key);
  report('');
  if(switching||!video.getAttribute('src'))video.src=films[key].src;
  const focusPlayer=document.activeElement===cover;
  cover.hidden=true;
  video.removeAttribute('aria-hidden');
  video.tabIndex=0;
  video.controls=!section.classList.contains('video-enhanced');
  if(focusPlayer)video.focus({preventScroll:true});
  if(video.error)video.load();
  // Keep play() in the original click gesture, including on iOS.
  const playRequest=video.play();
  upgrade();
  playRequest?.catch(error=>{
   if(ownAttempt!==attempt||error.name==='AbortError')return;
   if(error.name==='NotAllowedError'){
    report('Нажмите кнопку воспроизведения в плеере.');
   }else{
    report('Не удалось загрузить видео. Проверьте соединение и попробуйте ещё раз.');
    cover.hidden=false;
   }
  });
 }
 cover.addEventListener('click',()=>start());
 choices.forEach(choice=>choice.addEventListener('click',()=>start(choice.dataset.videoChoice)));
 section.querySelector('[data-video-book]').addEventListener('click',()=>{
  video.pause();
  openBooking({name:'Офтальмология и проверка зрения',kind:'service'});
 });
 video.addEventListener('play',setPlaying);
 video.addEventListener('pause',setPlaying);
 video.addEventListener('ended',setPlaying);
 video.addEventListener('playing',()=>{if(!status.textContent.startsWith('Доступен стандартный'))report('');});
 video.addEventListener('error',()=>{
  report('Не удалось загрузить видео. Проверьте соединение и попробуйте ещё раз.');
  cover.hidden=false;
 });
 // A booking window or a hidden tab should never keep speaking in the background.
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&!document.pictureInPictureElement)video.pause();});
 const dialogs=new MutationObserver(()=>{if(document.querySelector('dialog[open]'))video.pause();});
 document.querySelectorAll('dialog').forEach(dialog=>dialogs.observe(dialog,{attributes:true,attributeFilter:['open']}));
 if('IntersectionObserver' in window){
  new IntersectionObserver(entries=>{
   if(!entries[0].isIntersecting&&!document.pictureInPictureElement&&!document.fullscreenElement)video.pause();
  },{threshold:0}).observe(section.querySelector('.video-frame'));
 }
})();
