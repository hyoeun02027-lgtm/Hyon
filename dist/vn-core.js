/* Deterministic progression: text reveal, transitions and decisions are separate states. */
(function(root){
 class Engine{
  constructor(book,saved={}){this.book=book;this.path=book.nodes[saved.path]?saved.path:'';this.beat=Math.min(Math.max(0,Number(saved.beat)||0),this.node.beats.length-1);this.phase=['choice','end'].includes(saved.phase)&&this.beat===this.node.beats.length-1?saved.phase:'text';this.typing=this.phase==='text';this.lockUntil=0;this.lastInput=-Infinity;}
  get node(){return this.book.nodes[this.path];}
  get current(){return this.node.beats[this.beat];}
  snapshot(){return {path:this.path,beat:this.beat,phase:this.phase};}
  complete(){this.typing=false;}
  advance(now){if(now<this.lockUntil||now-this.lastInput<170)return 'blocked';this.lastInput=now;if(this.phase!=='text')return 'blocked';if(this.typing){this.typing=false;return 'reveal';}if(this.beat+1<this.node.beats.length){const before=this.current.stage;this.beat++;this.typing=true;const after=this.current.stage;this.lockUntil=now+(before.time!==after.time?400:0);return 'next';}this.phase=this.path.length===3?'end':'choice';return this.phase;}
  choose(letter,now){if(this.phase!=='choice'||!['A','B'].includes(letter)||!this.book.nodes[this.path+letter])return false;this.path+=letter;this.beat=0;this.phase='text';this.typing=true;this.lockUntil=now+400;this.lastInput=now;return true;}
  back(now){if(this.phase!=='text'){this.phase='text';this.typing=false;return true;}if(this.beat<=0)return false;this.beat--;this.typing=false;this.lockUntil=now+180;return true;}
 }
 const api={Engine};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.VNCore=api;
})(globalThis);
