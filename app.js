"use strict";
const content=window.MEDRAKURS_CONTENT;
const priceData=window.MEDRAKURS_PRICES;
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const groupById=new Map(content.groups.map(group=>[group.id,group]));
const serviceById=new Map(content.services.map(service=>[service.id,service]));
const doctorById=new Map(content.doctors.map(doctor=>[doctor.id,doctor]));
const booking=$('#booking-dialog'),catalog=$('#catalog-dialog'),serviceDialog=$('#service-dialog');
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
let catalogFilter='all',activeService=null,returnFocus=null,announcementIndex=0,serviceOrigin='catalog';
function icon(id){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('aria-hidden','true');const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href',`#${id}`);svg.append(use);return svg;}
function animateSoft(element,frames,options={}){if(!element?.animate)return;if(motionPreference.matches)return element.animate([{opacity:.8},{opacity:1}],{duration:120});return element.animate(frames,{duration:420,easing:'cubic-bezier(.22,1,.36,1)',...options});}
function openDialog(dialog,initiator=document.activeElement){if(!$$('dialog[open]').length)returnFocus=initiator;$$('dialog[open]').forEach(open=>open.close());dialog.showModal();dialog.scrollTop=0;document.body.classList.add('modal-open');scheduleAnnouncement();}
$$('dialog').forEach(dialog=>{dialog.addEventListener('close',()=>{document.body.classList.toggle('modal-open',!!$$('dialog[open]').length);if(!$$('dialog[open]').length&&returnFocus?.isConnected)returnFocus.focus({preventScroll:true});scheduleAnnouncement();});$('[data-close]',dialog).addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});});
$$('[data-service-count]').forEach(node=>node.textContent=content.services.length);$$('[data-doctor-count]').forEach(node=>node.textContent=content.doctors.length);
// Auto notices pause for reading, keyboard focus, dialogs and background tabs.
const announcementRegion=$('.announcement'),autoplayButton=$('#announcement-pause');
const ANNOUNCEMENT_INTERVAL=9000;
let announcementTimer=null,announcementProgress=null,userPaused=motionPreference.matches,hoverPaused=false,focusPaused=false;
const progressBar=document.createElement('span');progressBar.className='announcement-progress';progressBar.setAttribute('aria-hidden','true');announcementRegion.append(progressBar);
function renderAnnouncement(animate=false,direction=1){const item=content.announcements[announcementIndex];$('.announcement-tag').textContent=item.label;$('#announcement-title').textContent=item.title;$('#announcement-count').textContent=`${announcementIndex+1} / ${content.announcements.length}`;$('#announcement-count').setAttribute('aria-label',`Анонс ${announcementIndex+1} из ${content.announcements.length}`);if(animate)animateSoft($('#announcement-content'),[{opacity:0,transform:`translateX(${direction*10}px)`},{opacity:1,transform:'translateX(0)'}],{duration:300});}
function scheduleAnnouncement(){
 clearTimeout(announcementTimer);
 const paused=userPaused||hoverPaused||focusPaused||document.hidden||document.body.classList.contains('modal-open');
 announcementRegion.dataset.autoplay=paused?'paused':'running';
 $('#announcement-content').setAttribute('aria-live',paused?'polite':'off');
 autoplayButton.setAttribute('aria-pressed',String(userPaused));autoplayButton.setAttribute('aria-label',userPaused?'Продолжить анонсы':'Приостановить анонсы');$('use',autoplayButton).setAttribute('href',userPaused?'#play':'#pause');
 if(paused){announcementProgress?.pause();return;}
 announcementProgress?.cancel();
 if(!motionPreference.matches)announcementProgress=progressBar.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:ANNOUNCEMENT_INTERVAL,easing:'linear',fill:'forwards'});
 announcementTimer=setTimeout(()=>{announcementIndex=(announcementIndex+1)%content.announcements.length;renderAnnouncement(true,1);scheduleAnnouncement();},ANNOUNCEMENT_INTERVAL);
}
function changeAnnouncement(direction){announcementIndex=(announcementIndex+direction+content.announcements.length)%content.announcements.length;renderAnnouncement(true,direction);scheduleAnnouncement();}
$('#announcement-prev').addEventListener('click',()=>changeAnnouncement(-1));$('#announcement-next').addEventListener('click',()=>changeAnnouncement(1));
autoplayButton.addEventListener('click',()=>{userPaused=!userPaused;if(!userPaused){hoverPaused=false;focusPaused=false;}scheduleAnnouncement();});
announcementRegion.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'){hoverPaused=true;scheduleAnnouncement();}});
announcementRegion.addEventListener('pointerleave',event=>{if(event.pointerType==='mouse'){hoverPaused=false;scheduleAnnouncement();}});
announcementRegion.addEventListener('focusin',event=>{focusPaused=event.target!==autoplayButton;scheduleAnnouncement();});
announcementRegion.addEventListener('focusout',()=>queueMicrotask(()=>{focusPaused=announcementRegion.contains(document.activeElement)&&document.activeElement!==autoplayButton;scheduleAnnouncement();}));
document.addEventListener('visibilitychange',scheduleAnnouncement);
motionPreference.addEventListener('change',event=>{if(event.matches)userPaused=true;scheduleAnnouncement();});
$('#announcement-book').addEventListener('click',()=>openBooking({name:content.announcements[announcementIndex].request,kind:'announcement'}));renderAnnouncement();scheduleAnnouncement();
function createNewsCard(item){
 const card=document.createElement('article');card.className='news-card';
 if(item.id==='vision'){card.classList.add('news-vision');const image=document.createElement('img');image.className='news-media';image.src='vision-v5.webp';image.width=1448;image.height=1086;image.alt='';image.loading='lazy';image.setAttribute('aria-hidden','true');card.append(image);}
 const top=document.createElement('div');top.className='news-topline';
 const kind=document.createElement('span');kind.className='eyebrow';kind.textContent=item.kind;
 top.append(kind,icon(item.id==='vision'?'eye':item.id==='iv'?'heart':'calendar'));
 const title=document.createElement('h3');title.textContent=item.title;
 const text=document.createElement('p');text.textContent=item.text;
 const button=document.createElement('button');button.type='button';button.className='text-link booking-link';
 button.append(document.createTextNode(item.action),icon('calendar'));
 button.addEventListener('click',()=>openBooking({name:item.request,kind:'announcement'}));
 card.append(top,title,text,button);return card;
}
content.announcements.slice(0,3).forEach(item=>{const card=createNewsCard(item);card.dataset.reveal='';$('#news-grid').append(card);});
content.announcements.forEach(item=>$('#all-news').append(createNewsCard(item)));
$$('[data-news]').forEach(button=>button.addEventListener('click',()=>openDialog($('#news-dialog'))));
$$('[data-information]').forEach(button=>button.addEventListener('click',()=>openDialog($('#information-dialog'))));
// All 77 original service URLs are retained, including merged semantic duplicates.
content.groups.forEach(group=>$('#catalog-category').append(new Option(group.name,group.id)));
function normalize(text){return String(text||'').toLocaleLowerCase('ru').replace(/ё/g,'е').replace(/[–—-]/g,' ').replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();}
function matchesWords(text,query){const haystack=normalize(text);return normalize(query).split(/\s+/).filter(Boolean).every(word=>haystack.includes(word));}
function serviceMatches(query,group='all',filter='all'){
 return content.services.filter(item=>(group==='all'||group===item.group)&&(filter==='all'||item.tags.includes(filter))&&matchesWords([item.name,...item.aliases,groupById.get(item.group).name,...item.sources.map(source=>source.title)].join(' '),query));
}
function doctorMatches(query){if(!normalize(query))return [];return content.doctors.filter(doctor=>matchesWords(doctor.name+' '+doctor.role,query));}
function createSearchResult(item,type,origin='catalog'){
 const button=document.createElement('button');button.type='button';button.className='catalog-result';
 const copy=document.createElement('span'),name=document.createElement('span'),description=document.createElement('span');
 name.className='result-name';name.textContent=item.name;description.className='result-description';
 description.textContent=type==='doctor'?item.role:item.group==='vision'?'Консультация и диагностика · взрослые и дети':groupById.get(item.group).name;
 copy.append(name,description);button.append(copy,icon(type==='doctor'?'calendar':'arrow'));
 button.addEventListener('click',()=>type==='doctor'?openBooking({name:item.name,kind:'doctor'}):openService(item.id,origin));
 return button;
}
function renderCatalog(){
 const query=$('#catalog-search').value,group=$('#catalog-category').value;
 const services=serviceMatches(query,group,catalogFilter),doctors=group==='all'&&['all','consult'].includes(catalogFilter)?doctorMatches(query):[];
 $('#catalog-status').textContent=`Услуги: ${services.length}${doctors.length?' · Специалисты: '+doctors.length:''}`;
 const results=$('#catalog-results');results.replaceChildren();
 if(!services.length&&!doctors.length){const empty=document.createElement('p');empty.className='catalog-empty';empty.textContent='Не нашли подходящий вариант. Попробуйте другое название или оставьте вопрос администратору — поможем выбрать специалиста.';results.append(empty);return;}
 doctors.forEach(doctor=>results.append(createSearchResult(doctor,'doctor')));
 services.forEach(item=>results.append(createSearchResult(item,'service')));
}
function setCatalogFilter(filter){catalogFilter=filter;$$('[data-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===filter)));}
function openCatalog(category='all',query=''){$('#catalog-search').value=query;$('#catalog-category').value=groupById.has(category)?category:'all';setCatalogFilter(['consult','child'].includes(category)?category:'all');renderCatalog();openDialog(catalog);$('#catalog-search').focus();}
$$('[data-catalog]').forEach(button=>button.addEventListener('click',()=>openCatalog()));$$('[data-category]').forEach(button=>button.addEventListener('click',()=>openCatalog(button.dataset.category)));$('#catalog-search').addEventListener('input',renderCatalog);$('#catalog-category').addEventListener('change',renderCatalog);$$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{setCatalogFilter(button.dataset.filter);renderCatalog();}));
function openService(id,origin='catalog'){
 activeService=serviceById.get(id);if(!activeService)return;serviceOrigin=origin;
 $('#service-title').textContent=activeService.name;$('#service-group').textContent=groupById.get(activeService.group).name;
 $('#service-description').textContent=activeService.description||'Оставьте короткую заявку на консультацию или процедуру. Администратор поможет выбрать специалиста, объяснит подготовку и согласует ближайшее время приёма.';
 $('#service-back').replaceChildren(icon('arrow'),document.createTextNode(origin==='page'?'К направлениям':'К каталогу'));
 renderServicePrices(activeService);openDialog(serviceDialog);
}
function backToCatalog(){if(serviceOrigin==='page'){serviceDialog.close();return;}openDialog(catalog);$('#catalog-search').focus();}
$('#service-back').addEventListener('click',backToCatalog);serviceDialog.addEventListener('cancel',event=>{event.preventDefault();backToCatalog();});
$('#service-book').addEventListener('click',()=>openBooking({name:activeService.name,kind:'service'}));
$('#service-all-prices').addEventListener('click',()=>openPrices());
$$('[data-service]').forEach(button=>button.addEventListener('click',()=>openService(button.dataset.service,'page')));
function wordForm(number,one,few,many){const tens=number%100,last=number%10;return tens>=11&&tens<=14?many:last===1?one:last>=2&&last<=4?few:many;}
function createDoctorFacts(doctor){
 const data=doctor.prodoctorov;if(!data)return null;
 const box=document.createElement('div');box.className='doctor-facts';
 const meta=document.createElement('div');meta.className='doctor-credentials';
 const experience=document.createElement('span');experience.textContent=`Стаж ${data.experienceYears} ${wordForm(data.experienceYears,'год','года','лет')}`;meta.append(experience);
 if(data.category){const category=document.createElement('span');category.textContent=data.category;meta.append(category);}box.append(meta);
 const rating=document.createElement('a');rating.className='doctor-rating';rating.href=data.profileUrl||data.evidenceUrl;rating.target='_blank';rating.rel='noopener';
 if(data.rating!==null){rating.append(icon('star'));const score=document.createElement('strong');score.textContent=data.rating.toFixed(1).replace('.',',')+' / 5';const reviews=document.createElement('span');reviews.textContent=`${data.reviews} ${wordForm(data.reviews,'отзыв','отзыва','отзывов')}`;rating.append(score,reviews);}else{rating.classList.add('no-reviews');const empty=document.createElement('span');empty.textContent='Пока нет отзывов';rating.append(empty);}
 const source=document.createElement('span');source.className='rating-source';source.textContent='ПроДокторов';rating.append(source,icon('arrow-up'));rating.setAttribute('aria-label',`${doctor.name}: ${data.rating===null?'пока нет отзывов':`рейтинг ${data.rating.toFixed(1)} из 5, ${data.reviews} ${wordForm(data.reviews,'отзыв','отзыва','отзывов')}`}. Открыть ПроДокторов`);box.append(rating);
 if(data.education?.length){const details=document.createElement('details');details.className='doctor-education';const summary=document.createElement('summary');summary.textContent='Образование и подготовка';const list=document.createElement('ul');data.education.forEach(text=>{const li=document.createElement('li');li.textContent=text;list.append(li);});details.append(summary,list);box.append(details);}
 return box;
}
const featured=[{id:'doctor-03',short:'Илья Козловский',specialty:'Ортопедия и реабилитация',text:'Травматолог-ортопед, мануальный терапевт, остеопат, врач физической и реабилитационной медицины.'},{id:'doctor-07',short:'Эльвира Рубцова',specialty:'Детская дерматология',text:'Детский дерматолог, специалист по озонотерапии. Возраст приёма и расписание уточнит администратор.'},{id:'doctor-01',short:'Дмитрий Рассохин',specialty:'Остеопатия',text:'Врач-остеопат. Запись на консультацию и подготовку к визиту можно обсудить с администратором.'}];
featured.forEach(item=>{const doctor=doctorById.get(item.id),card=document.createElement('article');card.className='doctor-card';card.dataset.reveal='';const identity=document.createElement('div');identity.className='doctor-identity';const initials=document.createElement('span');initials.className='doctor-initials';initials.setAttribute('aria-hidden','true');initials.textContent=item.short.split(' ').map(part=>part[0]).join('');const copy=document.createElement('div'),name=document.createElement('h3'),specialty=document.createElement('div');name.textContent=item.short;specialty.className='doctor-specialty';specialty.textContent=item.specialty;copy.append(name,specialty);identity.append(initials,copy);const text=document.createElement('p');text.textContent=item.text;const button=document.createElement('button');button.className='text-link';button.type='button';button.append(document.createTextNode('Оставить заявку врачу'),icon('arrow-up'));button.addEventListener('click',()=>openBooking({name:doctor.name,kind:'doctor'}));const facts=createDoctorFacts(doctor);card.append(identity,text);if(facts)card.append(facts);card.append(button);$('#featured-doctors').append(card);});
content.doctors.forEach(doctor=>{const row=document.createElement('div');row.className='doctor-list-row';const copy=document.createElement('div'),name=document.createElement('h3'),role=document.createElement('p');name.textContent=doctor.name;role.textContent=doctor.role;copy.append(name,role);const facts=createDoctorFacts(doctor);if(facts)copy.append(facts);const button=document.createElement('button');button.className='icon-button';button.type='button';button.setAttribute('aria-label',`Оставить заявку: ${doctor.name}`);button.append(icon('arrow-up'));button.addEventListener('click',()=>openBooking({name:doctor.name,kind:'doctor'}));row.append(copy,button);$('#all-doctors').append(row);});$$('[data-doctors]').forEach(button=>button.addEventListener('click',()=>openDialog($('#doctors-dialog'))));
// Demo-only booking: no network, patient storage, date or time field.
const specialistSelect=$('#booking-specialist');const helpGroup=document.createElement('optgroup');helpGroup.label='Помощь с выбором';helpGroup.append(new Option('Помогите выбрать специалиста','help'));specialistSelect.append(helpGroup);const groupsOptions=document.createElement('optgroup');groupsOptions.label='Направления помощи';content.groups.forEach(group=>groupsOptions.append(new Option(group.name,`group:${group.id}`)));specialistSelect.append(groupsOptions);const doctorsOptions=document.createElement('optgroup');doctorsOptions.label='Специалисты центра';content.doctors.forEach(doctor=>doctorsOptions.append(new Option(doctor.name,`doctor:${doctor.id}`)));specialistSelect.append(doctorsOptions);
function clearErrors(){$$('.field input,.field select',booking).forEach(input=>input.removeAttribute('aria-invalid'));$$('.field-error',booking).forEach(node=>node.textContent='');}
function openBooking(request=null){closeMenu();$('#booking-entry').hidden=false;$('#booking-success').hidden=true;clearErrors();$('#request-choice')?.remove();const note=$('#booking-request-note');note.hidden=!request;note.textContent=request?`Ваш выбор: ${request.name}`:'';if(request){const existing=content.doctors.find(doctor=>doctor.name===request.name);if(existing)specialistSelect.value=`doctor:${existing.id}`;else{const option=new Option(request.name,'request');option.id='request-choice';specialistSelect.append(option);specialistSelect.value='request';}}else specialistSelect.value='';booking.setAttribute('aria-labelledby','booking-title');openDialog(booking);updateLivePreview();}
$$('[data-book]').forEach(button=>button.addEventListener('click',()=>openBooking()));
function phoneDigits(value){let digits=value.replace(/\D/g,'');if(digits.length===10&&digits[0]==='9')digits='7'+digits;if(digits.length===11&&digits[0]==='8')digits='7'+digits;return digits;}
function phoneValid(value){return /^7\d{10}$/.test(phoneDigits(value))&&!/[^+\d\s()\-.]/.test(value);}
function phoneFormat(value){const d=phoneDigits(value);return `+7 (${d.slice(1,4)}) ${d.slice(4,7)}-${d.slice(7,9)}-${d.slice(9,11)}`;}
const fields=[{id:'booking-specialist',error:'specialist-error',message:'Выберите специалиста или пункт «Помогите выбрать».',valid:value=>Boolean(value)},{id:'booking-name',error:'name-error',message:'Укажите имя — от двух букв.',valid:value=>/^[\p{L}\s’'\-]{2,60}$/u.test(value.trim())&&value.trim().replace(/[^\p{L}]/gu,'').length>=2},{id:'booking-phone',error:'phone-error',message:'Укажите телефон: +7 и ещё 10 цифр.',valid:phoneValid}];
fields.forEach(field=>{const input=$('#'+field.id),clear=()=>{input.removeAttribute('aria-invalid');$('#'+field.error).textContent='';};input.addEventListener('input',clear);input.addEventListener('change',clear);});$('#booking-phone').addEventListener('blur',event=>{if(phoneValid(event.target.value))event.target.value=phoneFormat(event.target.value);});
$('#fill-example').addEventListener('click',()=>{$('#booking-name').value='Анна';$('#booking-phone').value='+7 (900) 123-45-67';if(!specialistSelect.value)specialistSelect.value='help';clearErrors();updateLivePreview();animateSoft($('#booking-form'),[{opacity:.6},{opacity:1}],{duration:200});});
$('#booking-form').addEventListener('submit',event=>{event.preventDefault();clearErrors();let firstInvalid=null;fields.forEach(field=>{const input=$('#'+field.id);if(!field.valid(input.value)){input.setAttribute('aria-invalid','true');$('#'+field.error).textContent=field.message;firstInvalid??=input;}});if(firstInvalid){firstInvalid.focus();return;}const rows=[['Имя',$('#booking-name').value.trim()],['Телефон',phoneFormat($('#booking-phone').value)],['Специалист',specialistSelect.selectedOptions[0].textContent]];const preview=$('#max-request-preview');preview.replaceChildren();rows.forEach(([label,value])=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;preview.append(dt,dd);});$('#booking-entry').hidden=true;$('#booking-success').hidden=false;booking.setAttribute('aria-labelledby','booking-success-title');booking.scrollTop=0;$('#booking-success-title').focus({preventScroll:true});animateSoft($('.success-icon'),[{opacity:0,transform:'scale(.8)'},{opacity:1,transform:'scale(1)'}],{duration:400});});
$('#booking-again').addEventListener('click',()=>{$('#booking-entry').hidden=false;$('#booking-success').hidden=true;booking.setAttribute('aria-labelledby','booking-title');booking.scrollTop=0;specialistSelect.focus({preventScroll:true});});booking.addEventListener('close',()=>{if(!booking.open){$('#booking-form').reset();clearErrors();$('#max-request-preview').replaceChildren();updateLivePreview();}});
const menuToggle=$('.menu-toggle'),mobileMenu=$('#mobile-menu');function closeMenu(){mobileMenu.hidden=true;menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','Открыть меню');}menuToggle.addEventListener('click',()=>{const isOpen=menuToggle.getAttribute('aria-expanded')==='true';mobileMenu.hidden=isOpen;menuToggle.setAttribute('aria-expanded',String(!isOpen));menuToggle.setAttribute('aria-label',isOpen?'Открыть меню':'Закрыть меню');});$$('a',mobileMenu).forEach(link=>link.addEventListener('click',closeMenu));document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!mobileMenu.hidden){closeMenu();menuToggle.focus();}});matchMedia('(min-width:901px)').addEventListener('change',event=>{if(event.matches)closeMenu();});
const readingToggle=$('.reading-toggle');let readingMode=false;try{readingMode=localStorage.getItem('medrakurs-reading-mode')==='true';}catch{}function applyReadingMode(){document.body.classList.toggle('reading-mode',readingMode);readingToggle.setAttribute('aria-pressed',String(readingMode));readingToggle.setAttribute('aria-label',readingMode?'Обычная версия сайта':'Версия для слабовидящих');}readingToggle.addEventListener('click',()=>{readingMode=!readingMode;applyReadingMode();try{localStorage.setItem('medrakurs-reading-mode',String(readingMode));}catch{}});applyReadingMode();
if('IntersectionObserver' in window){const actionsObserver=new IntersectionObserver(([entry])=>document.body.classList.toggle('mobile-cta-visible',!entry.isIntersecting&&entry.boundingClientRect.top<0));actionsObserver.observe($('.hero-actions'));const revealNodes=$$('[data-reveal]'),revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}}),{threshold:.08,rootMargin:'0px 0px 24px 0px'});if(!motionPreference.matches){document.body.classList.add('reveal-ready');revealNodes.forEach((node,index)=>{node.style.transitionDelay=`${Math.min(index%3,2)*55}ms`;revealObserver.observe(node);});}motionPreference.addEventListener('change',event=>{if(event.matches){document.body.classList.remove('reveal-ready');revealObserver.disconnect();}});}else document.body.classList.add('mobile-cta-visible');

// Booking actions use a calendar or a call icon, navigation keeps its arrows.
function polishActionButtons(){
 $$('[data-book],#service-book,#announcement-book,.news-card>button.text-link,.doctor-card>button.text-link').forEach(button=>{const svg=$(':scope>svg',button);if(svg)svg.replaceWith(icon(button.classList.contains('dark')?'phone':'calendar'));if(button.classList.contains('text-link'))button.classList.add('booking-link');});
 const submit=$(':scope>svg',$('.form-submit'));if(submit)submit.replaceWith(icon('send'));
 $$('.doctor-list-row .icon-button').forEach(button=>button.replaceChildren(icon('calendar')));
 $$('.button').forEach(button=>{const svg=$(':scope>svg',button);if(!svg)return;svg.setAttribute('aria-hidden','true');const badge=document.createElement('span');badge.className='action-icon';svg.replaceWith(badge);badge.append(svg);});
}
polishActionButtons();
document.addEventListener('pointerdown',event=>{
 const button=event.target.closest('.button,.booking-link');if(!button||button.disabled||motionPreference.matches)return;
 const rect=button.getBoundingClientRect(),wave=document.createElement('span');wave.className='press-ripple';wave.setAttribute('aria-hidden','true');wave.style.left=(event.clientX-rect.left)+'px';wave.style.top=(event.clientY-rect.top)+'px';button.append(wave);
 wave.animate([{transform:'translate(-50%,-50%) scale(.1)',opacity:.22},{transform:`translate(-50%,-50%) scale(${Math.max(rect.width,rect.height)/12})`,opacity:0}],{duration:480,easing:'ease-out'}).finished.then(()=>wave.remove()).catch(()=>wave.remove());
});

// Search is available on the page and uses the same index as the full catalog.
const careSearch=$('#care-search-input');
function renderCareSearch(){
 const query=careSearch.value,hasQuery=Boolean(normalize(query));
 const results=$('#care-search-results');results.replaceChildren();
 $('.direction-grid').hidden=hasQuery;$('.specialty-links').hidden=hasQuery;
 results.hidden=!hasQuery;$('#care-search-clear').hidden=!hasQuery;
 $('#care-search-more').hidden=true;
 $$('[data-search-query]').forEach(button=>button.setAttribute('aria-pressed',String(normalize(button.dataset.searchQuery)===normalize(query))));
 if(!hasQuery){$('#care-search-status').textContent='';return;}
 const matches=[...doctorMatches(query).map(item=>({item,type:'doctor'})),...serviceMatches(query).map(item=>({item,type:'service'}))];
 $('#care-search-status').textContent=matches.length?`Найдено: ${matches.length}. Выберите подходящий вариант.`:'Не нашли совпадений. Администратор поможет выбрать специалиста.';
 if(!matches.length){
  const empty=document.createElement('div');empty.className='care-search-empty';
  const text=document.createElement('p');text.textContent='Опишите свой вопрос в заявке. Мы уточним, кто сможет вам помочь.';
  const button=document.createElement('button');button.type='button';button.className='text-link booking-link';button.append(document.createTextNode('Помогите выбрать'),icon('calendar'));
  button.addEventListener('click',()=>openBooking({name:'Помогите выбрать специалиста: '+query.trim().slice(0,120),kind:'question'}));empty.append(text,button);results.append(empty);return;
 }
 matches.slice(0,6).forEach(({item,type})=>results.append(createSearchResult(item,type,'page')));
 $('#care-search-more').hidden=matches.length<=6;
}
careSearch.addEventListener('input',renderCareSearch);
careSearch.addEventListener('keydown',event=>{if(event.key==='Enter'&&normalize(careSearch.value)){event.preventDefault();openCatalog('all',careSearch.value);}});
$$('[data-search-query]').forEach(button=>button.addEventListener('click',()=>{careSearch.value=button.dataset.searchQuery;renderCareSearch();}));
$('#care-search-clear').addEventListener('click',()=>{careSearch.value='';renderCareSearch();careSearch.focus({preventScroll:true});});
$('#care-search-more').addEventListener('click',()=>openCatalog('all',careSearch.value));
renderCareSearch();

// Live MAX preview is rendered only in memory. It never sends or stores a request.
function updateLivePreview(){
 const preview=$('#max-live-fields');if(!preview)return;
 const values={name:$('#booking-name').value.trim(),phone:$('#booking-phone').value.trim(),specialist:specialistSelect.value?specialistSelect.selectedOptions[0].textContent:''};
 const placeholders={name:'Имя пациента',phone:'Номер для звонка',specialist:'Специалист или направление'};
 Object.entries(values).forEach(([key,value])=>{const field=$(`[data-preview="${key}"]`,preview);field.textContent=value||placeholders[key];field.classList.toggle('is-placeholder',!value);});
}
$('#booking-form').addEventListener('input',updateLivePreview);
specialistSelect.addEventListener('change',updateLivePreview);

// Local searchable prices and all fifteen source pages keep the presentation on this site.
const pricesDialog=$('#prices-dialog');
let priceCategory='all',pricePage=1;
const numberFormat=new Intl.NumberFormat('ru-RU');
function priceAmount(item){if(item.amount===null)return 'Уточним при записи';return numberFormat.format(item.amount)+(item.rangeMax?'–'+numberFormat.format(item.rangeMax):'')+' ₽';}
function priceMatches(item,query){return matchesWords([item.name,...item.aliases,item.note].join(' '),query);}
function createPriceRow(item){
 const row=document.createElement('article');row.className='price-row';
 const copy=document.createElement('div'),name=document.createElement('h3'),note=document.createElement('p');name.textContent=item.name;note.textContent=item.note;copy.append(name,note);
 if(item.page){const source=document.createElement('button');source.type='button';source.className='price-source';source.textContent=`Прайс, стр. ${item.page}`;source.addEventListener('click',()=>showPricePage(item.page));copy.append(source);}
 const action=document.createElement('div');action.className='price-row-action';
 const amount=document.createElement('strong');amount.className=item.amount===null?'price-unknown':'price-amount';amount.textContent=priceAmount(item);
 const book=document.createElement('button');book.type='button';book.className='icon-button';book.setAttribute('aria-label','Оставить заявку: '+item.name);book.append(icon('calendar'));book.addEventListener('click',()=>openBooking({name:item.name,kind:'service'}));
 action.append(amount,book);row.append(copy,action);return row;
}
function renderPrices(){
 const query=$('#price-search').value,hasQuery=Boolean(normalize(query));
 const matches=priceData.items.filter(item=>(hasQuery||item.amount!==null)&&(priceCategory==='all'||item.category===priceCategory)&&priceMatches(item,query));
 const rows=$('#price-results');rows.replaceChildren();matches.forEach(item=>rows.append(createPriceRow(item)));
 $('#price-status').textContent=hasQuery?`В быстром списке найдено: ${matches.length}`:`Быстрый список: ${matches.length} ${wordForm(matches.length,'услуга','услуги','услуг')}. Все позиции — в полном прайсе.`;
 if(!matches.length){const empty=document.createElement('p');empty.className='catalog-empty';empty.textContent='В быстром списке такой услуги нет. Проверьте совпадения в полном документе или уточните стоимость у администратора.';rows.append(empty);}
 const pages=hasQuery?priceData.pages.filter(page=>matchesWords(page.text,query)):[];
 const documentMatches=$('#price-document-matches');documentMatches.replaceChildren();documentMatches.hidden=!pages.length;
 if(pages.length){
  const title=document.createElement('p');title.textContent='Совпадения в полном прайсе:';documentMatches.append(title);
  const links=document.createElement('div');pages.forEach(page=>{const button=document.createElement('button');button.type='button';button.textContent='Стр. '+page.page;button.addEventListener('click',()=>showPricePage(page.page));links.append(button);});documentMatches.append(links);
 }
}
function setPriceTab(tabId,focus=false){
 $$('.price-tabs [role="tab"]').forEach(tab=>{const selected=tab.id===tabId;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;$('#'+tab.getAttribute('aria-controls')).hidden=!selected;if(selected&&focus)tab.focus();});
 if(tabId==='prices-full-tab')renderPricePage(pricePage);
}
function renderPricePage(page){
 pricePage=Math.max(1,Math.min(priceData.pages.length,Number(page)||1));
 const image=$('#price-document-image');image.src=`price-page-${String(pricePage).padStart(2,'0')}.webp`;image.alt=`Оригинал прайса медицинского центра от 1 октября 2026 года, страница ${pricePage} из ${priceData.pages.length}`;
 $('#price-page-select').value=String(pricePage);$('#price-page-prev').disabled=pricePage===1;$('#price-page-next').disabled=pricePage===priceData.pages.length;
 $('#price-page-status').textContent=`Страница ${pricePage} из ${priceData.pages.length}`;
}
function showPricePage(page){pricePage=page;setPriceTab('prices-full-tab');$('.price-document-tools').scrollIntoView({block:'nearest',behavior:motionPreference.matches?'instant':'smooth'});}
function openPrices(query=''){
 $('#price-search').value=query;priceCategory='all';$$('[data-price-category]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.priceCategory==='all')));setPriceTab('prices-quick-tab');renderPrices();openDialog(pricesDialog);$('#price-search').focus({preventScroll:true});
}
priceData.categories.forEach(category=>{const button=document.createElement('button');button.type='button';button.dataset.priceCategory=category.id;button.textContent=category.name;button.setAttribute('aria-pressed',String(category.id==='all'));button.addEventListener('click',()=>{priceCategory=category.id;$$('[data-price-category]').forEach(tab=>tab.setAttribute('aria-pressed',String(tab===button)));renderPrices();});$('#price-filters').append(button);});
$$('[data-prices]').forEach(button=>button.addEventListener('click',()=>openPrices()));
$('#price-search').addEventListener('input',()=>{setPriceTab('prices-quick-tab');renderPrices();});
$$('.price-tabs [role="tab"]').forEach(tab=>{tab.addEventListener('click',()=>setPriceTab(tab.id));tab.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const tabs=$$('.price-tabs [role="tab"]'),index=event.key==='Home'?0:event.key==='End'?tabs.length-1:(tabs.indexOf(tab)+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;setPriceTab(tabs[index].id,true);});});
priceData.pages.forEach(page=>$('#price-page-select').append(new Option(`${page.page} / ${priceData.pages.length}`,String(page.page))));
$('#price-page-select').addEventListener('change',event=>renderPricePage(event.target.value));
$('#price-page-prev').addEventListener('click',()=>renderPricePage(pricePage-1));$('#price-page-next').addEventListener('click',()=>renderPricePage(pricePage+1));
function renderServicePrices(service){
 const box=$('#service-prices');box.replaceChildren();
 const related=priceData.items.filter(item=>item.serviceIds.includes(service.id));
 if(related.length&&related.every(item=>item.amount===null)){const note=document.createElement('p');note.className='service-price-note';note.textContent=related[0].note;box.append(note);return;}
 if(!related.length){const text=document.createElement('p');text.className='service-price-note';text.textContent='Стоимость и состав услуги уточнит администратор перед записью.';box.append(text);return;}
 const label=document.createElement('p');label.className='eyebrow';label.textContent='Стоимость по прайсу';box.append(label);
 related.slice(0,3).forEach(item=>{const row=document.createElement('div');row.className='service-price';const name=document.createElement('span'),amount=document.createElement('strong');name.textContent=item.name;amount.textContent=priceAmount(item);row.append(name,amount);box.append(row);});
 const note=document.createElement('p');note.className='service-price-note';note.textContent=related[0].amount===null?related[0].note:'Прайс от 01.10.2026. Условия и все варианты — в полном документе.';box.append(note);
}

// Campaign motion is local and bounded. Forms, search and notice controls stay still.
const campaignHero=$('.hero'),finePointer=matchMedia('(hover: hover) and (pointer: fine)');
let heroMotionFrame=0,heroTarget={x:0,y:0};
function paintHeroMotion(){heroMotionFrame=0;campaignHero.style.setProperty('--hero-x',heroTarget.x+'px');campaignHero.style.setProperty('--hero-y',heroTarget.y+'px');}
function resetHeroMotion(){heroTarget={x:0,y:0};if(!heroMotionFrame)heroMotionFrame=requestAnimationFrame(paintHeroMotion);}
campaignHero.addEventListener('pointermove',event=>{
 if(motionPreference.matches||!finePointer.matches)return;
 const box=campaignHero.getBoundingClientRect();
 heroTarget={x:((event.clientX-box.left)/box.width-.5)*9,y:((event.clientY-box.top)/box.height-.5)*7};
 if(!heroMotionFrame)heroMotionFrame=requestAnimationFrame(paintHeroMotion);
},{passive:true});
campaignHero.addEventListener('pointerleave',resetHeroMotion);
motionPreference.addEventListener('change',event=>{if(event.matches)resetHeroMotion();});
if(!motionPreference.matches){
 animateSoft($('#hero-title'),[{opacity:.3,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:700});
 animateSoft($('.hero-actions'),[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:600,delay:110,fill:'backwards'});
}
$$('.doctor-card>.booking-link').forEach((button,index)=>{
 const doctor=doctorById.get(featured[index].id);
 button.setAttribute('aria-label','Записаться к врачу: '+doctor.name);
 button.title='Записаться к врачу: '+doctor.name;
});
