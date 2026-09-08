def demographic_world(seed, years=1000):
    rng=random.Random(810000+seed)
    next_id=0
    people={}
    def add_person(year, sex=None, age=None, region=None, parents=()):
        nonlocal next_id
        pid=f"P{next_id:07}"; next_id+=1
        people[pid]={"id":pid,"sex":sex or rng.choice("FM"),"birth_year":year-(age if age is not None else 0),
                     "alive":True,"region":region if region is not None else rng.randrange(5),
                     "partner":None,"parents":tuple(parents),"children":[],
                     "family_pref":rng.choices([0,1,2,3,4,5,6],[4,10,34,30,14,6,2])[0],
                     "intent":rng.choice(("wait","open","seeking")),"widowed":False}
        return pid
    # Historical Year-0 population with heterogeneous ages/families.
    for _ in range(rng.randint(1500,2200)): add_person(0,age=rng.randint(0,78))
    # Pair some compatible adults at Year 0.
    males=[p for p in people.values() if p["sex"]=="M" and 18<=-p["birth_year"]<=55]
    females=[p for p in people.values() if p["sex"]=="F" and 18<=-p["birth_year"]<=45]
    rng.shuffle(males);rng.shuffle(females)
    for a,b in zip(males[:int(len(males)*.55)],females[:int(len(females)*.55)]):
        if a["region"]!=b["region"] and rng.random()<.45:a["region"]=b["region"]
        a["partner"]=b["id"];b["partner"]=a["id"]

    # Integrated-system state carried in same timeline.
    pressure=.24;cooldown=0
    stock={g:rng.randint(900,1700) for g in ("food","medicine","fuel","cloth","tools")}
    treasury=9000.0; objects={}; owner_index=collections.defaultdict(set); memories={}; norms={}; institutions={}; stats=collections.Counter()
    magical={} # subset references real people IDs
    founders=rng.sample([p["id"] for p in people.values() if -p["birth_year"]>=18],60)
    for pid in founders:
        rank=rng.choices(range(1,6),[48,31,14,6,1])[0]
        magical[pid]={"rank":rank,"stars":rng.randint(0,3),"manifest":[rank+rng.uniform(-.3,.15) for _ in range(20)],
                      "aura":rng.randrange(20)}
    def make_obj(kind,y,origin,owner,parent=None):
        oid=f"O{len(objects)+1:08}";objects[oid]={"id":oid,"kind":kind,"year":y,"origin":origin,
            "owner":owner,"parent":parent,"condition":1.0,"history":[["created",y,origin,owner]]}
        owner_index[owner].add(oid);return oid

    yearly=[]; failures=[]
    for year in range(years):
        alive=[p for p in people.values() if p["alive"]]; p0=len(alive)
        births=deaths=0

        # Observability + social adaptation: partner scarcity changes matchmaking effort/transport.
        adultF=[p for p in alive if p["sex"]=="F" and 18<=year-p["birth_year"]<=42 and not p["partner"]]
        adultM=[p for p in alive if p["sex"]=="M" and 18<=year-p["birth_year"]<=55 and not p["partner"]]
        scarcity=len(adultF)+len(adultM)>0 and min(len(adultF),len(adultM))/max(1,max(len(adultF),len(adultM)))<.55
        match_attempt=.34+(.28 if scarcity else 0)
        rng.shuffle(adultF);rng.shuffle(adultM)
        # cross-region search and marriage migration are explicit.
        for f in adultF:
            if not adultM or rng.random()>match_attempt: continue
            pool=adultM[:min(30,len(adultM))]
            m=min(pool,key=lambda x:(0 if x["region"]==f["region"] else .22)+abs((year-x["birth_year"])-(year-f["birth_year"]))/60+rng.random()*.25)
            if rng.random()<(.78 if m["region"]==f["region"] else .52+(.18 if scarcity else 0)):
                if m["region"]!=f["region"]:
                    # actual migration, not bonus
                    if rng.random()<.5:m["region"]=f["region"]
                    else:f["region"]=m["region"]
                    stats["marriage_migrations"]+=1
                f["partner"]=m["id"];m["partner"]=f["id"];adultM.remove(m);stats["partnerships"]+=1

        # Reproductive intent is double-buffered: intent chosen this year affects births no earlier than next year's evaluation.
        next_intent={}
        for p in alive:
            if p["sex"]!="F":continue
            age=year-p["birth_year"]
            if 18<=age<=42 and p["partner"] and people[p["partner"]]["alive"]:
                completed=len(p["children"]);pref=p["family_pref"]
                if completed>=pref: ni="done"
                elif stock["food"]<max(300,p0*.08) or stock["medicine"]<120: ni=rng.choice(("wait","open"))
                elif p["intent"]=="wait": ni=rng.choices(("wait","open","seeking"),[45,35,20])[0]
                else: ni=rng.choices(("wait","open","seeking"),[20,42,38])[0]
                next_intent[p["id"]]=ni

        # Births use prior intent only.
        newborns=[]
        for f in [p for p in alive if p["sex"]=="F" and 18<=year-p["birth_year"]<=42 and p["partner"]]:
            if not people[f["partner"]]["alive"]:continue
            completed=len(f["children"])
            if completed>=f["family_pref"]:continue
            base={"wait":.065,"open":.23,"seeking":.38,"done":0}.get(f["intent"],.085)
            # age/family spacing
            age=year-f["birth_year"]; agefactor=max(.25,1-abs(age-29)/22)
            recent=any(year-people[c]["birth_year"]<2 for c in f["children"] if c in people)
            if recent:base*=.16
            if rng.random()<base*agefactor:
                nid=add_person(year,region=f["region"],parents=(f["id"],f["partner"]))
                f["children"].append(nid);people[f["partner"]]["children"].append(nid);newborns.append(nid);births+=1
        for pid,ni in next_intent.items():
            if people[pid]["alive"]:people[pid]["intent"]=ni

        # Rank-aware mundane mortality envelope + surge exceptional mortality below.
        for p in list(alive):
            age=year-p["birth_year"];rank=magical.get(p["id"],{}).get("rank",0)
            # Diamond ordinary senescence false; higher ranks progressively extend aging.
            threshold={0:72,1:95,2:135,3:330,4:650,5:10**9}[rank]
            annual=.0012 if age<45 else .0035 if age<65 else .012
            if age>threshold:annual+=min(.22,(age-threshold)*.008)
            if rank==5:annual=min(annual,.001) # accidents etc., not old age
            if rng.random()<annual:
                p["alive"]=False;deaths+=1;stats["deaths"]+=1
                if p["partner"] and people[p["partner"]]["alive"]:
                    spouse=people[p["partner"]];spouse["partner"]=None;spouse["widowed"]=True;stats["widowhoods"]+=1
                # estate/title continuity
                owned=[objects[oid] for oid in list(owner_index.get(p["id"],())) if objects[oid]["condition"]>0]
                heirs=[people[c] for c in p["children"] if c in people and people[c]["alive"]]
                owner=rng.choice(heirs)["id"] if heirs else f"estate:{p['id']}"
                for o in owned:
                    owner_index[p["id"]].discard(o["id"]);owner_index[owner].add(o["id"])
                    o["owner"]=owner;o["history"].append(["inherited",year,p["id"],owner]);stats["inheritances"]+=1

        # economy
        alive_now=sum(p["alive"] for p in people.values())
        for g in stock:
            stock[g]=max(0,stock[g]+int(alive_now*rng.uniform(.13,.22))-int(alive_now*rng.uniform(.12,.205)))
        # environmental magic / surge + Society response
        pressure=min(1.3,pressure+rng.uniform(.045,.074));warning=max(0,min(1,(pressure-.5)*1.7+rng.uniform(-.14,.14)))
        surge=cooldown<=0 and pressure>rng.uniform(.77,.95)
        surge_deaths=0
        if surge:
            stats["surges"]+=1;cooldown=rng.randint(6,11)
            manifested=max(10,int(rng.gauss(125*pressure,22)));stats["monster_manifestations"]+=manifested
            candidates=[pid for pid,m in magical.items() if people.get(pid,{}).get("alive") and m["stars"]>=1]
            party=sorted(candidates,key=lambda pid:magical[pid]["rank"],reverse=True)[:4]
            defense=.15+warning*.18+sum(magical[p]["rank"]+1 for p in party)/max(1,len(party)*6)*.45
            severity=max(.04,pressure*rng.uniform(.75,1.22)-defense)
            victims=[p for p in people.values() if p["alive"] and p["id"] not in party]
            rng.shuffle(victims)
            n=min(len(victims),int(len(victims)*severity*rng.uniform(.0002,.0015)))
            for p in victims[:n]:
                p["alive"]=False;surge_deaths+=1;deaths+=1
                if p["partner"] and people[p["partner"]]["alive"]:people[p["partner"]]["partner"]=None
            for pid in party:
                m=magical[pid]
                for s in rng.sample(range(20),rng.randint(1,4)):m["manifest"][s]=min(5,m["manifest"][s]+rng.uniform(.01,.045))
                stats["adventurer_deployments"]+=1
            recovered=int(manifested*(.18+.28*defense))
            for _ in range(recovered):
                owner=rng.choice(party) if party else "estate:civilization"
                body=make_obj("monster_remains",year,f"surge:{year}",owner)
                if rng.random()<.38:make_obj("monster_core",year,f"harvest:{body}",owner,body)
                if rng.random()<.06:make_obj("Essence",year,f"surge-manifestation:{year}",owner)
                if rng.random()<.04:make_obj("Awakening Stone",year,f"surge-manifestation:{year}",owner)
            mid=f"M{len(memories)+1:06}";memories[mid]={"event":"monster_surge","year":year,"strength":min(1,.35+severity)}
            pressure=max(.12,pressure-rng.uniform(.46,.64))
        cooldown=max(0,cooldown-1)

        # magical recruitment from actual living population, no anonymous overlay.
        eligible=[p for p in people.values() if p["alive"] and year-p["birth_year"]>=18 and p["id"] not in magical]
        if eligible and rng.random()<min(.5,alive_now/7000):
            p=rng.choice(eligible);magical[p["id"]]={"rank":1,"stars":0,"manifest":[1+rng.uniform(-.2,.06) for _ in range(20)],"aura":rng.randrange(20)}
            stats["new_magical"]+=1

        # ordinary missions using actual people
        for _ in range(rng.randint(2,6)):
            party=[pid for pid,m in magical.items() if people[pid]["alive"] and m["stars"]>=1]
            if len(party)<2:break
            party=sorted(party,key=lambda p:magical[p]["rank"],reverse=True)[:4]
            success=rng.random()<(.48+.08*sum(magical[p]["rank"] for p in party)/len(party))
            stats["missions"]+=1;stats["mission_success"]+=success;stats["mission_failure"]+=not success
            if success and rng.random()<.35:make_obj("harvest_material",year,f"mission:{year}",rng.choice(party))

        # culture memory -> practice -> norm -> institution
        for m in memories.values():
            if rng.random()<m["strength"]*.07:m["strength"]=min(1,m["strength"]+.005);stats["retellings"]+=1
            else:m["strength"]=max(0,m["strength"]-.004)
            if m["strength"]>.3 and rng.random()<.03:stats["surge_practice"]+=1
        if stats["surge_practice"]>=12 and "surge_preparedness" not in norms:norms["surge_preparedness"]={"formed":year};stats["norms"]+=1
        if "surge_preparedness" in norms and year-norms["surge_preparedness"]["formed"]>15 and "surge_office" not in institutions:
            institutions["surge_office"]={"founded":year};stats["institutions"]+=1

        # fatal population ledger: every countable person remains explicit.
        pend=sum(p["alive"] for p in people.values())
        if pend != p0+births-deaths:failures.append(["population_conservation",year,p0,births,deaths,pend])
        yearly.append({"year":year,"population":pend,"births":births,"deaths":deaths,"surge_deaths":surge_deaths,
                       "partnerships":stats["partnerships"],"living_magical":sum(people[p]["alive"] for p in magical)})
        if pend==0:break

    # invariants
    for p in people.values():
        if p["partner"] and people[p["partner"]]["partner"]!=p["id"] and p["alive"] and people[p["partner"]]["alive"]:
            failures.append(["asymmetric_partner",p["id"]]);break
    if any(m["stars"]>3 for m in magical.values()):failures.append(["stars"])
    if any(len(m["manifest"])!=20 for m in magical.values()):failures.append(["manifestations"])
    return {"seed":seed,"year_reached":year+1,"population":sum(p["alive"] for p in people.values()),
            "people_ever":len(people),"magical_ever":len(magical),"stats":dict(stats),"objects":len(objects),
            "memories":len(memories),"norms":norms,"institutions":institutions,"yearly":yearly,"failures":failures,
            "completed_children_women":[len(p["children"]) for p in people.values() if p["sex"]=="F" and year-p["birth_year"]>45]}
