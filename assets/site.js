(() => {
 const ko=document.documentElement.lang==='ko';
 const toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('#site-nav');
 if(toggle&&nav){toggle.hidden=false;nav.classList.add('collapsible');toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open)});document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false')}})}
 const filters=document.querySelector('[data-publication-filters]');
 if(filters){
  filters.hidden=false;const search=filters.querySelector('input'),year=filters.querySelector('[name=year]'),topic=filters.querySelector('[name=topic]');
  const records=[...document.querySelectorAll('[data-publication]')],count=document.querySelector('[data-result-count]'),empty=document.querySelector('[data-empty]');
  function update(){const q=search.value.trim().toLocaleLowerCase().normalize('NFKC');let total=0;for(const r of records){const match=(!q||r.textContent.toLocaleLowerCase().normalize('NFKC').includes(q))&&(!year.value||r.dataset.year===year.value)&&(!topic.value||r.dataset.topics.split(',').includes(topic.value));r.hidden=!match;if(match)total++}document.querySelectorAll('.publication-section').forEach(s=>s.hidden=![...s.querySelectorAll('[data-publication]')].some(r=>!r.hidden));count.textContent=ko?`${records.length}건 중 ${total}건 표시`:`Showing ${total} of ${records.length} records`;empty.hidden=total!==0;}
  search.addEventListener('input',update);year.addEventListener('change',update);topic.addEventListener('change',update);filters.querySelector('button').addEventListener('click',()=>{search.value='';year.value='';topic.value='';update();search.focus()});update();
 }
 let dialog;
 function showImage(img){
  if(!dialog){dialog=document.createElement('dialog');dialog.className='image-dialog';dialog.setAttribute('aria-label',ko?'그림 확대':'Enlarged image');dialog.innerHTML='<div class="image-toolbar"><a target="_blank" rel="noopener noreferrer"></a><button type="button"></button></div><img alt=""><p></p>';dialog.querySelector('button').textContent=ko?'닫기 ×':'Close ×';dialog.querySelector('a').textContent=ko?'원본 파일 열기 ↗':'Open original file ↗';document.body.append(dialog);dialog.querySelector('button').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});}
  const full=dialog.querySelector('img');full.src=img.dataset.original||img.currentSrc;full.alt=img.alt;dialog.querySelector('a').href=full.src;dialog.querySelector('p').textContent=img.alt;dialog.showModal();
 }
 document.querySelectorAll('.post-body img:not(.author-photo),.album-grid img').forEach(img=>{const a=img.closest('a');if(a){a.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey)return;e.preventDefault();showImage(img)})}else{const b=document.createElement('button');b.type='button';b.className='image-zoom';b.setAttribute('aria-label',(ko?'그림 확대: ':'Enlarge image: ')+img.alt);img.replaceWith(b);b.append(img);b.addEventListener('click',()=>showImage(img))}});
})();
