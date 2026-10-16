'use strict';
const menu=document.querySelector('.menu-toggle');
if(menu){const nav=document.getElementById('main-nav');menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open)});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');nav.classList.remove('open')}));document.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.setAttribute('aria-expanded','false');nav.classList.remove('open')}})}
const board=document.getElementById('demo-board');
if(board){
 const script=document.currentScript;
 fetch(new URL('demo.json',script.src)).then(r=>{if(!r.ok)throw new Error('Puzzle unavailable');return r.json()}).then(puzzle=>{
  const n=puzzle.size;let cells=Array(n*n).fill(0);const status=document.getElementById('demo-status');
  const roomAt=(r,c)=>puzzle.rooms.findIndex(([t,l,h,w])=>r>=t&&r<t+h&&c>=l&&c<l+w);
  const answer=i=>(BigInt(puzzle.solution)>>BigInt(i))&1n?1:2;
  const buttons=[];
  for(let i=0;i<n*n;i++){
   const r=Math.floor(i/n),c=i%n,id=roomAt(r,c),room=puzzle.rooms[id],button=document.createElement('button');
   button.type='button';button.className='demo-cell';button.dataset.state='0';
   const edges={Top:r===room[0],Left:c===room[1],Bottom:r===room[0]+room[2]-1,Right:c===room[1]+room[3]-1};
   for(const [edge,visible]of Object.entries(edges))if(visible){button.style['border'+edge]='2px solid #58e6f3'}
   if(r===room[0]&&c===room[1]){const clue=document.createElement('span');clue.className='clue';clue.textContent=room[4];button.append(clue)}
   const mark=document.createElement('span');mark.className='cell-mark';mark.setAttribute('aria-hidden','true');button.append(mark);
   button.addEventListener('click',()=>{cells[i]=(cells[i]+1)%3;render();status.textContent=cells.every((v,j)=>v===answer(j))?'That’s your aha. Puzzle complete!':'Keep going. Every cell has its place.'});
   button.addEventListener('keydown',e=>{const delta={ArrowRight:1,ArrowLeft:-1,ArrowDown:n,ArrowUp:-n}[e.key];if(delta){e.preventDefault();const next=i+delta;if(next>=0&&next<n*n)buttons[next].focus()}});
   board.append(button);buttons.push(button)
  }
  function render(){buttons.forEach((button,i)=>{const r=Math.floor(i/n),c=i%n,room=puzzle.rooms[roomAt(r,c)];button.dataset.state=String(cells[i]);button.querySelector('.cell-mark').textContent=cells[i]===1?'●':cells[i]===2?'•':'';button.setAttribute('aria-label','Row '+(r+1)+', column '+(c+1)+', '+['empty','shaded','white'][cells[i]]+(r===room[0]&&c===room[1]?', room clue '+room[4]:''))})}
  document.getElementById('demo-check').addEventListener('click',()=>{status.textContent=cells.includes(0)?'Mark every cell, then check your puzzle.':cells.every((v,i)=>v===answer(i))?'That’s your aha. Puzzle complete!':'Not quite yet. Check the four rules and try another angle.'});
  document.getElementById('demo-reset').addEventListener('click',()=>{cells.fill(0);render();status.textContent='A fresh start. Your next aha is waiting.'});
  document.getElementById('demo-hint').addEventListener('click',()=>{const i=cells.findIndex((v,j)=>v!==answer(j));if(i<0){status.textContent='Already brilliant. This puzzle is complete!';return}cells[i]=answer(i);render();status.textContent=cells.every((v,j)=>v===answer(j))?'That’s your aha. Puzzle complete!':'One cell revealed. Follow the logic from here.'});
  render()
 }).catch(()=>{document.getElementById('demo-status').textContent='The demo could not load. Please refresh the page.'})
}
