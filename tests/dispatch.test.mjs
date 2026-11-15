import assert from 'node:assert/strict';
import test from 'node:test';
import {handleWebhook} from '../relay-node.mjs';
import {createHmac} from 'node:crypto';
test('real dispatch core sanitizes payload and propagates downstream failure', async()=>{
 const previous=globalThis.fetch;const secret='synthetic-test-only-secret';const env={STRIPE_WEBHOOK_SECRET:secret,GITHUB_TOKEN:'synthetic-token',GITHUB_REPO:'fixture/ops'};
 const data=JSON.stringify({type:'checkout.session.completed',created:123,data:{object:{id:'cs_test_synthetic',customer_email:'not-forwarded@example.invalid'}}});
 const t=Math.floor(Date.now()/1000);const sig=createHmac('sha256',secret).update(t+'.'+data).digest('hex');
 let calls=0;
 globalThis.fetch=async(url,options)=>{calls++;assert.equal(url,'https://api.github.com/repos/fixture/ops/dispatches');const body=JSON.parse(options.body);assert.equal(body.event_type,'honorbox_sale');assert.equal(body.client_payload.event,'checkout.session.completed');assert.match(body.client_payload.ref,/^[0-9a-f]{10}$/);assert.ok(!JSON.stringify(body).includes('not-forwarded'));return new Response(null,{status:204});};
 const request=()=>new Request('https://fixture.invalid/',{method:'POST',body:data,headers:{'stripe-signature':`t=${t},v1=${sig}`}});
 try {let r=await handleWebhook(request(),env);assert.equal(r.status,200);assert.equal(await r.text(),'dispatched');assert.equal(calls,1);globalThis.fetch=async()=>new Response('downstream failure',{status:503});r=await handleWebhook(request(),env);assert.equal(r.status,502);}finally{globalThis.fetch=previous;}
});
