import random, collections, statistics

def explicit_step(chars, events):
    out=[]; ledger=collections.Counter()
    for c,e in zip(chars,events):
        n=dict(c)
        if e["death"]:
            n["alive"]=False; ledger["deaths"]+=1
        else:
            if e["migrate"] and n["region"]!=e["dest"]:
                n["region"]=e["dest"]; ledger["migrations"]+=1
            if e["practice"]: n["practice"]+=1; ledger["practice"]+=1
            if e["birth"]: ledger["births"]+=1
        out.append(n)
    return out,ledger

def cohort_step(chars, events):
    transitioned,ledger=explicit_step(chars,events)
    result=collections.Counter((c["alive"],c["region"],c["practice"]) for c in transitioned)
    return result,ledger

def proof(seed, n=5000, ticks=200):
    rng=random.Random(820000+seed)
    chars=[{"id":i,"alive":True,"region":rng.randrange(6),"practice":rng.randrange(4)} for i in range(n)]
    failures=[]; compression=[]
    for t in range(ticks):
        events=[]
        for c in chars:
            if not c["alive"]:
                events.append({"death":False,"migrate":False,"dest":c["region"],"practice":False,"birth":False}); continue
            death=rng.random()<.0015
            events.append({"death":death,"migrate":not death and rng.random()<.012,"dest":rng.randrange(6),
                           "practice":not death and rng.random()<.045,"birth":not death and rng.random()<.008})
        exp,le=explicit_step(chars,events); agg,la=cohort_step(chars,events)
        expagg=collections.Counter((c["alive"],c["region"],c["practice"]) for c in exp)
        if expagg!=agg: failures.append(("state",t))
        if le!=la: failures.append(("ledger",t))
        compression.append(len(chars)/max(1,len(agg))); chars=exp
    return {"seed":seed,"failures":failures,"mean_compression":statistics.mean(compression),"final_cohorts":len(agg)}

if __name__=="__main__":
    ps=[proof(i) for i in range(8)]
    assert all(not p["failures"] for p in ps)
    print("PASS",sum(5000*200 for _ in ps),"character transitions")
