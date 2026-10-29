/* Original supplied sheet, displayed through CSS windows. No repainting or resampling. */
const Kuong={
 sheet:'assets/kuong/sheet.png',width:1536,height:1024,
 frames:{
  neutral:[796,65,141,107,'기본 표정'],sparkle:[940,57,145,115,'눈 반짝임'],wink:[1085,62,147,111,'윙크'],smile:[1234,60,143,115,'웃음'],excited:[1376,56,142,120,'신남'],
  curious:[1080,202,147,112,'궁금함'],think:[1230,203,145,112,'생각'],resolve:[1376,199,142,118,'비장함'],moved:[1080,354,145,122,'감동'],
  modern:[29,65,143,163,'과잠 입은 현재의 쿠옹이'],
  artisan:[22,574,211,272,'장인 쿠옹이'],scholar:[242,558,207,289,'학자 쿠옹이'],merchant:[454,558,202,289,'상인 쿠옹이'],interpreter:[663,558,208,289,'역관 쿠옹이'],officer:[878,558,197,289,'무관 쿠옹이'],painter:[1081,558,217,289,'화원 쿠옹이'],physician:[1304,558,210,289,'의관 쿠옹이']
 },
 jobs:{craft:['artisan','장인'],engineering:['artisan','장인'],research:['scholar','학자'],care:['physician','의관'],trade:['merchant','상인'],arts:['painter','화원']},
 sprite(name,extra=''){const [x,y,w,h,label]=this.frames[name]||this.frames.neutral;return `<span class="ku-sprite ${extra}" data-kuong="${name}" role="img" aria-label="${label}" style="--ku-ratio:${w}/${h};--ku-width:${1536/w*100}%;--ku-left:${-x/w*100}%;--ku-top:${-y/h*100}%"><img src="${this.sheet}" alt="" width="1536" height="1024" decoding="async" draggable="false"></span>`;},
 guide(face,title,text,extra=''){return `<aside class="ku-guide ${extra}">${this.sprite(face)}<div><p class="ku-guide-label">쿠옹이의 안내</p><strong>${title}</strong><p>${text}</p></div></aside>`;},
 traits(chart,answers){const top=chart.sorted.filter(e=>chart.elements[e]>0).slice(0,3);const cards=top.map((e,i)=>({face:['neutral','sparkle','wink'][i],label:e+'의 상징',title:SidaeCore.symbolism[e].word,text:SidaeCore.symbolism[e].strength}));if(cards.length<3)cards.push({face:'curious',label:'직접 고른 가치관',title:answers.community?'공동체':'개인의 완성',text:answers.community?'함께 이어가는 성과를 중요하게 골랐어요.':'내 이름으로 완성하는 작품을 중요하게 골랐어요.'});return `<div class="ku-traits">${cards.map(c=>`<article>${this.sprite(c.face)}<small>${c.label}</small><h3>${c.title}</h3><p>${c.text}</p></article>`).join('')}</div>`;},
 recommendation(r,i){const [job,label]=this.jobs[r.domain]||['scholar','학자'];return `<figure class="ku-job-art">${this.sprite(job,'ku-job')}<span class="ku-job-reaction">${this.sprite(['sparkle','wink','think'][i])}</span><figcaption>${label} 쿠옹이와 살펴보는 가능성</figcaption></figure>`;},
 ending(path){return {AAA:'resolve',AAB:'think',ABA:'neutral',ABB:'smile',BAA:'think',BAB:'moved',BBA:'sparkle',BBB:'smile'}[path]||'neutral';},
 async paint(){await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);}
};
