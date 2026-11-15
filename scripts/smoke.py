#!/usr/bin/env python3
"""Real signed webhook validation; never triggers an external repository action."""
import hashlib,hmac,json,os,time,urllib.request,urllib.error
b=os.environ['BASE_URL'].rstrip('/');phase=os.environ['SMOKE_PHASE'];assert phase in ('boot','upgrade','redeploy');secret=os.environ['STRIPE_WEBHOOK_SECRET']
def req(path='/',body=None,signature=None,expected=200):
 h={'Content-Type':'application/json'}
 if signature:h['Stripe-Signature']=signature
 q=urllib.request.Request(b+path,headers=h,data=body)
 try:r=urllib.request.urlopen(q,timeout=30)
 except urllib.error.HTTPError as e:r=e
 with r:status=r.code;raw=r.read().decode()
 assert status==expected,f'webhook expected {expected}, got {status}'
 return raw
assert json.loads(req('/health'))['status']=='ok'
req(expected=405)
body=json.dumps({'id':'evt_railway_validation','type':'customer.created','data':{'object':{}}}).encode()
req(body=body,signature='t=1,v1='+'0'*64,expected=400)
now=int(time.time());sig=hmac.new(secret.encode(),str(now).encode()+b'.'+body,hashlib.sha256).hexdigest()
assert req(body=body,signature=f't={now},v1={sig}')=='ignored'
stale=now-600;sig=hmac.new(secret.encode(),str(stale).encode()+b'.'+body,hashlib.sha256).hexdigest()
req(body=body,signature=f't={stale},v1={sig}',expected=400)
req(body=b'x'*(1048576+1),signature='t=1,v1='+'0'*64,expected=413)
print(json.dumps({'ok':True,'phase':phase,'signed_webhook_and_replay_boundary':True,'stateless':True,'external_dispatch_proven':False}))
