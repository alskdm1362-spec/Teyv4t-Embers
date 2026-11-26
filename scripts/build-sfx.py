#!/usr/bin/env python3
"""Original deterministic game SFX. No sampled or downloaded input recordings.
Requires existing numpy/scipy. Rebuild from repository root: python scripts/build-sfx.py
"""
from pathlib import Path
import hashlib,json,math,wave
import numpy as np
from scipy.signal import butter,sosfilt

RATE=24000
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'dist/assets/audio/sfx'
OUT.mkdir(parents=True,exist_ok=True)

def tt(d):return np.arange(round(d*RATE),dtype=np.float64)/RATE

def taper(x,attack=.001,release=.012):
 x=np.asarray(x,dtype=np.float64).copy();a=min(len(x),int(attack*RATE));r=min(len(x),int(release*RATE))
 if a:x[:a]*=np.linspace(0,1,a)**1.2
 if r:x[-r:]*=np.linspace(1,0,r)**1.5
 return x

def filtered(rng,t,lo=100,hi=7000):
 n=rng.normal(0,1,len(t));sos=butter(2,[lo,hi],btype='bandpass',fs=RATE,output='sos');return sosfilt(sos,n)

def env(t,decay=.06,attack=.002):return (1-np.exp(-t/max(.0001,attack)))*np.exp(-t/max(.001,decay))

def chirp(t,start,end,duration,decay=.12):
 f=start+(end-start)*np.minimum(t/duration,1)**.6
 return np.sin(np.cumsum(f)*2*np.pi/RATE)*env(t,decay)

def metal(t,base=1100,decay=.10,ratios=(1,2.71,4.13,5.31)):
 y=np.zeros_like(t)
 for i,r in enumerate(ratios):
  f=base*r
  if f<RATE*.44:y+=np.sin(2*np.pi*f*t+.13*i)*env(t,decay/(1+i*.38),.0007)/(1+i)**1.1
 return y

def burst(rng,t,lo,hi,decay=.04,attack=.001):return filtered(rng,t,lo,hi)*env(t,decay,attack)

def shifted(t,at,fn):
 out=np.zeros_like(t);mask=t>=at;out[mask]=fn(t[mask]-at);return out

def wind(rng,t,lo,hi,width=.21):
 phase=np.minimum(t/width,1);amp=np.sin(np.pi*phase)**2.2
 return filtered(rng,t,lo,hi)*amp

def sprinkle(rng,t,centers,lo=1800,hi=7000):
 y=np.zeros_like(t)
 for i,at in enumerate(centers):y+=shifted(t,at,lambda u:burst(rng,u,lo,hi,.005+i*.001))*(.4/(1+i*.3))
 return y

DURATIONS={
 'spear_whoosh':.22,'spear_hit':.22,'heavy_whoosh':.34,'heavy_hit':.32,
 'arcane_cast':.48,'arcane_hit':.38,'shield_cast':.47,'shield_hit':.29,
 'counter':.25,'dagger':.22,'abyss_cast':.48,'abyss_hit':.39,'celestial_hit':.44,
 'card_deal':.105,'card_discard':.145,'card_morph':.45,'resource':.30,
 'heal':.86,'victory':.92,'ui_click':.065,
}

def design(key,seed):
 rng=np.random.default_rng(seed);t=tt(DURATIONS[key]);v=(seed%7-3)/140
 if key=='spear_whoosh':
  y=wind(rng,t,450,5000,.21)*.7+wind(rng,t,1800,7500,.18)*.2
  y+=.05*chirp(t,920,220,.22,.11)
 elif key=='spear_hit':
  y=.38*burst(rng,t,1800,8500,.014)+.30*metal(t,1260*(1+v),.065)
  y+=.18*chirp(t,190,85,.055,.055)+.15*burst(rng,t,150,2200,.024)
 elif key=='heavy_whoosh':
  y=.9*wind(rng,t,100,1550,.33)+.28*wind(rng,t,800,5000,.30)
  y+=.13*chirp(t,185,65,.28,.21)
 elif key=='heavy_hit':
  y=.52*chirp(t,180*(1+v),57,.09,.078)+.8*burst(rng,t,130,1900,.048)
  y+=.2*burst(rng,t,2200,7800,.013)+.16*metal(t,480,.054,(1,2.18,3.7,7.1))
  y+=.20*shifted(t,.022,lambda u:burst(rng,u,450,3400,.025))
 elif key=='arcane_cast':
  y=.24*wind(rng,t,500,3500,.46)
  for i,r in enumerate((1,1.503,2.02)):
   f=(230+610*(t/.48)**1.6)*r*(1+.006*np.sin(2*np.pi*(7+i)*t))
   y+=np.sin(2*np.pi*np.cumsum(f)/RATE)*np.sin(np.pi*np.minimum(t/.48,1))**1.8*.10/(i+1)
  y+=.12*sprinkle(rng,t,[.07,.12,.18,.26,.34],2300,9000)
 elif key=='arcane_hit':
  y=.35*burst(rng,t,700,6400,.044)+.2*metal(t,710,.13,(1,2.01,3.27,5.59))
  y+=.1*chirp(t,350,130,.11,.10)+.12*sprinkle(rng,t,[.017,.039,.078,.13])
 elif key=='shield_cast':
  y=np.zeros_like(t)
  for i,f in enumerate((523.25,783.99,1174.66)):
   y+=shifted(t,i*.043,lambda u:metal(u,f,.16,(1,2.004,3.97)))*.1
  y+=.17*wind(rng,t,800,5200,.36)+.07*chirp(t,330,950,.36,.21)
 elif key=='shield_hit':
  y=.31*burst(rng,t,1600,8800,.018)+.23*metal(t,870*(1+v),.092,(1,2.33,4.74,7.1))
  y+=.13*chirp(t,240,110,.06,.056)
 elif key=='counter':
  y=.44*wind(rng,t,900,6400,.12)
  y+=shifted(t,.075,lambda u:.32*metal(u,1040,.075,(1,2.69,4.07))+.25*burst(rng,u,700,6000,.023))
 elif key=='dagger':
  y=.32*wind(rng,t,1500,8000,.10)
  y+=shifted(t,.05,lambda u:.30*burst(rng,u,1700,9000,.012)+.15*metal(u,1680*(1+v),.042,(1,2.49,3.69)))
 elif key=='abyss_cast':
  rough=filtered(rng,t,180,2700)*(1+.68*np.sin(2*np.pi*38*t)+.22*np.sin(2*np.pi*71*t))
  y=np.tanh(rough*1.6)*.27*np.sin(np.pi*np.minimum(t/.48,1))**1.7
  y+=.12*chirp(t,154,62,.42,.26)+.06*np.sin(2*np.pi*520*t+3*np.sin(2*np.pi*43*t))*env(t,.25,.04)
 elif key=='abyss_hit':
  rough=burst(rng,t,240,4200,.082)*(1+.65*np.sin(2*np.pi*51*t))
  y=.52*np.tanh(rough*1.4)+.2*chirp(t,150,64,.13,.10)
  y+=.12*shifted(t,.031,lambda u:burst(rng,u,900,5200,.045))
 elif key=='celestial_hit':
  y=.24*metal(t,1380,.16,(1,1.601,2.603,4.217))+.3*burst(rng,t,2200,9500,.014)
  y+=.10*metal(t,690,.10,(1,2,3.05))+.04*sprinkle(rng,t,[.042,.086,.135])
 elif key=='card_deal':
  y=.8*wind(rng,t,1400,7500,.072)+.32*shifted(t,.041,lambda u:burst(rng,u,1800,8200,.007))
  y+=.04*chirp(t,420,210,.05,.023)
 elif key=='card_discard':
  y=.85*wind(rng,t,650,5000,.11)+.32*shifted(t,.067,lambda u:burst(rng,u,800,6400,.016))
  y+=.12*chirp(t,330,160,.07,.030)
 elif key=='card_morph':
  y=.19*wind(rng,t,700,4400,.41)*(1+.6*np.sin(2*np.pi*17*t))
  y+=.11*chirp(t,370,155,.4,.25)+.06*np.sin(2*np.pi*620*t+3*np.sin(2*np.pi*19*t))*env(t,.18,.018)
  y+=.07*sprinkle(rng,t,[.05,.11,.16,.22,.31],1500,6800)
 elif key=='resource':
  y=.12*metal(t,784,.09,(1,2.005,3.98))
  y+=shifted(t,.07,lambda u:.1*metal(u,1174.66,.12,(1,2.01,3.1)))
  y+=.05*burst(rng,t,2200,7500,.012)
 elif key=='heal':
  y=.065*wind(rng,t,320,2200,.80)
  for i,f in enumerate((392,493.88,587.33)):
   y+=shifted(t,.075+i*.14,lambda u:.065*metal(u,f,.23,(1,2.003,3.012)))
  y+=.06*sprinkle(rng,t,[.04,.14,.27,.37,.51,.64,.75],1300,6200)
 elif key=='victory':
  y=np.zeros_like(t)
  for i,f in enumerate((523.25,659.25,783.99)):
   y+=shifted(t,i*.15,lambda u:.10*metal(u,f,.29,(1,2.001,3.004))+.045*np.sin(2*np.pi*f*.5*u)*env(u,.23,.005))
  y+=.045*wind(rng,t,1200,5200,.64)
 elif key=='ui_click':
  y=.45*burst(rng,t,1500,6800,.007)+.12*chirp(t,630,350,.019,.012)
 else:raise KeyError(key)
 # Short outer fades prevent edge clicks while retaining intentional transients.
 return taper(y,.0008,.010)

variant_counts={'spear_whoosh':2,'spear_hit':2,'heavy_hit':2,'dagger':2,'card_deal':3,'card_discard':2}
assets={};stats=[]
for index,key in enumerate(DURATIONS):
 assets[key]=[]
 for variant in range(variant_counts.get(key,1)):
  seed=171100+index*113+variant*29;y=design(key,seed);y-=np.mean(y)
  # Quiet UI and paper; stronger attacks retain peak headroom for summing.
  target_db=-23 if key.startswith('card_') or key=='ui_click' else -20.5
  target_peak=.42 if key=='ui_click' else .58
  rms=float(np.sqrt(np.mean(y*y)));peak=float(np.max(np.abs(y)))
  y*=min(target_peak/max(peak,1e-9),10**(target_db/20)/max(rms,1e-9))
  y=taper(y,.0005,.006);pcm=np.round(np.clip(y,-.99,.99)*32767).astype('<i2')
  filename=key+(f'-{variant+1}' if variant_counts.get(key,1)>1 else '')+'.wav';path=OUT/filename
  with wave.open(str(path),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(RATE);w.writeframes(pcm.tobytes())
  measured=pcm.astype(float)/32768
  entry={'src':'assets/audio/sfx/'+filename,'duration':round(len(y)/RATE,5),'peakDbFS':round(20*np.log10(max(float(np.max(np.abs(measured))),1e-9)),2),'rmsDbFS':round(20*np.log10(max(float(np.sqrt(np.mean(measured**2))),1e-9)),2),'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
  assets[key].append(entry);stats.append(entry)
manifest={'version':1,'sampleRate':RATE,'channels':1,'encoding':'PCM signed 16-bit little endian WAV','provenance':'Original deterministic DSP waveforms authored for this project; no recorded or downloaded sample input.','references':['https://kenney.nl/assets/impact-sounds','https://kenney.nl/assets/rpg-audio','https://kenney.nl/assets/interface-sounds','https://kenney.nl/support'],'assets':assets}
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'files':len(stats),'bytes':sum(e['bytes'] for e in stats),'peakMaxDbFS':max(e['peakDbFS'] for e in stats),'durationMax':max(e['duration'] for e in stats),'keys':list(assets)},ensure_ascii=False))
