import {test,expect} from '@playwright/test';
import {bookingAccount,bookingSkill,cleanupBookings} from '../helpers/local-bookings';

test('slow navigation acknowledges the click on desktop and mobile while keeping the header usable',async({page})=>{
 await bookingAccount(page.request,'Navigation delay');
 await page.emulateMedia({reducedMotion:'reduce'});
 try{
 for(const width of [1280,320]){
  await page.setViewportSize({width,height:800});
  const gate=Promise.withResolvers<void>();
  let held=0;
  await page.route('**/wallet?*',async route=>{
   if(route.request().headers().rsc!=='1'){await route.continue();return;}
   held++;await gate.promise;await route.continue();
  });
  try{
   await page.goto('/dashboard');
   await expect(page.getByRole('heading',{name:/Welcome,/})).toBeVisible();
   const mobile=width<1024;
   if(mobile)await page.locator('summary').filter({hasText:'Menu'}).click();
   const nav=page.getByRole('navigation',{name:mobile?'Mobile member navigation':'Member navigation',exact:true});
   await nav.getByRole('link',{name:'Wallet',exact:true}).click();
   await expect.poll(()=>held).toBeGreaterThan(0);
   await expect(page.getByRole('status').filter({hasText:/Opening Wallet|Loading your page/}).first()).toBeVisible();
   await expect(page.getByLabel('Color theme')).toBeEnabled();
   await page.getByLabel('Color theme').selectOption('dark');
   await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
   gate.resolve();
   await expect(page).toHaveURL(/\/wallet$/);
   await expect(page.getByRole('heading',{name:'Your wallet',exact:true})).toBeVisible();
   if(mobile)await expect(page.locator('details')).not.toHaveAttribute('open','');
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }finally{gate.resolve();await page.unrouteAll({behavior:'wait'});}
 }
 }finally{await cleanupBookings(page.request);}
});

test('focus and visibility events cannot overlap a slow refresh, and polling resumes after it finishes',async({page})=>{
 await bookingAccount(page.request,'Refresh delay');
 await page.goto('/bookings');
 await expect(page.getByRole('heading',{name:'Your bookings',exact:true})).toBeVisible();
 await page.getByLabel('Color theme').selectOption('dark');
 await page.waitForLoadState('networkidle');
 const gate=Promise.withResolvers<void>();let refreshes=0;
 await page.route('**/bookings*',async route=>{
  if(route.request().headers().rsc!=='1'){await route.continue();return;}
  refreshes++;await gate.promise;await route.continue();
 });
 try{
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await expect.poll(()=>refreshes).toBe(1);
  await page.evaluate(async()=>{
   for(let i=0;i<3;i++){
    await new Promise(resolve=>setTimeout(resolve,150));
    window.dispatchEvent(new Event('focus'));
    document.dispatchEvent(new Event('visibilitychange'));
   }
  });
  expect(refreshes).toBe(1);
  const finished=page.waitForResponse(response=>new URL(response.url()).pathname==='/bookings'&&response.request().headers().rsc==='1',{timeout:5000});
  // Next's development RSC stream can stay open for updates; wait for the
  // response and exercise the next refresh instead of waiting for HTTP EOF.
  gate.resolve();expect((await finished).status()).toBe(200);
  await page.waitForTimeout(200);
  await page.evaluate(()=>Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'}));
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await page.waitForTimeout(200);expect(refreshes).toBe(1);
  await page.evaluate(()=>{Reflect.deleteProperty(document,'visibilityState');document.dispatchEvent(new Event('visibilitychange'));});
  await expect.poll(async()=>{await page.evaluate(()=>window.dispatchEvent(new Event('focus')));return refreshes;}).toBe(2);
  await expect(page.getByRole('heading',{name:'Your bookings',exact:true})).toBeVisible();
 }finally{gate.resolve();if(!page.isClosed())await page.unrouteAll({behavior:'wait'});await cleanupBookings(page.request);}
});

test('booking and discovery filter submissions retain the document, theme and member header',async({page})=>{
 await bookingAccount(page.request,'Filter navigation');
 await page.setViewportSize({width:320,height:800});
 try{
  for(const path of ['/bookings','/discover']){
   await page.goto(path);
   await page.getByLabel('Color theme').selectOption('dark');
   const marker=await page.evaluate(()=>{const value=crypto.randomUUID();Reflect.set(window,'__navigationDocument',value);return value;});
   if(path==='/bookings'){
    await page.getByLabel('View',{exact:true}).selectOption('history');
    await page.getByLabel('Status',{exact:true}).selectOption('cancelled');
    await page.getByLabel('Your role',{exact:true}).selectOption('learner');
   }else{
    await page.getByLabel('Wanted skill',{exact:true}).selectOption(bookingSkill);
    await page.getByLabel('Available now only').check();
   }
   const response=page.waitForResponse(r=>{
    const url=new URL(r.url());
    return r.request().headers().rsc==='1'&&url.pathname===path&&(path==='/bookings'?url.searchParams.get('view')==='history':url.searchParams.get('availableOnly')==='true');
   });
   await page.getByRole('button',{name:'Apply filter',exact:true}).click();
   expect((await response).status()).toBe(200);
   await expect(page).toHaveURL(path==='/bookings'?/view=history.*state=cancelled.*role=learner/:/skillId=.*availableOnly=true/);
   await expect(page.getByRole('heading',{name:path==='/bookings'?'Your bookings':'Discover members',exact:true})).toBeVisible();
   expect(await page.evaluate(()=>Reflect.get(window,'__navigationDocument'))).toBe(marker);
   await expect(page.getByLabel('Color theme')).toHaveValue('dark');
   await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
   await expect(page.locator('summary').filter({hasText:'Menu'})).toBeVisible();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
 }finally{await cleanupBookings(page.request);}
});
