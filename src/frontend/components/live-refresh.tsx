'use client';
import {useEffect,useRef,useTransition} from 'react';
import {useRouter} from 'next/navigation';
export function usePageRefresh(enabled=true,seconds=15){
 const router=useRouter();
 const [pending,startTransition]=useTransition();
 const refreshing=useRef(false);
 useEffect(()=>{refreshing.current=pending;},[pending]);
 useEffect(()=>{
  if(!enabled)return;
  const refresh=()=>{
   if(document.visibilityState!=='visible'||refreshing.current)return;
   // Hold the guard through the RSC response and commit, not just one microtask.
   refreshing.current=true;
   startTransition(()=>router.refresh());
  };
  const timer=setInterval(refresh,seconds*1000);
  window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',refresh);
  return()=>{clearInterval(timer);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh);};
 },[enabled,seconds,router,startTransition]);
}
export function LiveRefresh({seconds=15}:{seconds?:number}){usePageRefresh(true,seconds);return null;}
