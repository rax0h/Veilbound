def sim7(seed, years=140):
    rng=random.Random(770000+seed)
    people={f"C{i:03}":{"id":f"C{i:03}","alive":True,"wealth":rng.uniform(40,500),"craft":rng.random(),
                           "age":rng.randint(18,55),"heir":f"C{(i+1)%80:03}"} for i in range(80)}
    objs={};stats=collections.Counter()
    def new(kind,y,origin,owner,qty=1,parent=None):
        oid=f"O{len(objs)+1:07}";objs[oid]={"id":oid,"kind":kind,"origin":origin,"owner":owner,"qty":qty,
        "parent":parent,"condition":1.0,"processed":False,"history":[["created",y,origin,owner]]};return oid
    for _ in range(700): new(rng.choices(KINDS,[32,15,7,5,41])[0],0,f"expedition:{rng.randint(1,400)}",rng.choice(list(people)),rng.randint(1,4))
    for y in range(years):
        for _ in range(rng.randint(8,18)):new(rng.choices(KINDS,[31,16,8,5,40])[0],y,f"expedition:{y}:{rng.randint(1,99)}",rng.choice(list(people)),rng.randint(1,3))
        active=lambda o: o["condition"]>0 and (o["owner"] in people and people[o["owner"]]["alive"])
        for o in list(objs.values()):
            if active(o) and rng.random()<.16:
                if rng.random()<.025:o["condition"]=max(0,o["condition"]-.35);o["history"].append(["transport_damage",y]);stats["transport_damage"]+=1
                else:o["history"].append(["transported",y]);stats["transported"]+=1
        cand=[o for o in objs.values() if active(o) and not o["processed"] and o["kind"] in ("monster_remains","harvest_material")]
        rng.shuffle(cand)
        for o in cand[:rng.randint(5,14)]:
            if people[o["owner"]]["craft"]>.28:
                o["processed"]=True;cid=new("processed_material",y,f"processing:{o['id']}",o["owner"],o["qty"],o["id"])
                objs[cid]["condition"]=o["condition"]*.95;o["history"].append(["processed_into",y,cid]);stats["processed"]+=1
        live=[o for o in objs.values() if active(o)]
        supply=collections.Counter(o["kind"] for o in live)
        for o in rng.sample(live,min(len(live),rng.randint(18,45))):
            if rng.random()>.22:continue
            seller=people[o["owner"]];buyers=[p for p in people.values() if p["alive"] and p["id"]!=seller["id"]]
            if not buyers:continue
            buyer=rng.choice(buyers);price=BASE_FUNCTION.get(o["kind"],26)*(1+30/max(10,supply[o["kind"]]))*o["condition"]*(1+min(.8,.03*len(o["history"])))*o["qty"]
            if buyer["wealth"]>=price:
                buyer["wealth"]-=price;seller["wealth"]+=price;old=o["owner"];o["owner"]=buyer["id"];o["history"].append(["sold",y,old,buyer["id"],round(price,2)]);stats["sales"]+=1
        mats=[o for o in objs.values() if active(o) and o["kind"]=="processed_material" and o["condition"]>.4]
        rng.shuffle(mats)
        for a in mats[:rng.randint(0,5)]:
            c=people[a["owner"]]
            if c["craft"]>.55 and not any(h[0]=="crafted_into" for h in a["history"]):
                aid=new("artifact",y,f"craft:{c['id']}",c["id"],1,a["id"]);objs[aid]["condition"]=a["condition"]*.96;a["history"].append(["crafted_into",y,aid]);stats["artifacts"]+=1
        cons=[o for o in objs.values() if active(o) and o["kind"] in ("Essence","Awakening Stone","monster_core")]
        for o in rng.sample(cons,min(len(cons),rng.randint(1,8))):
            if rng.random()<.12:o["condition"]=0;o["history"].append(["consumed",y,o["owner"]]);stats["consumed"]+=1
        for p in people.values():
            if not p["alive"]:continue
            p["age"]+=1
            if p["age"]>65 and rng.random()<min(.22,(p["age"]-64)*.009):
                p["alive"]=False;heir=people[p["heir"]]
                for o in [x for x in objs.values() if x["owner"]==p["id"] and x["condition"]>0]:
                    o["owner"]=heir["id"] if heir["alive"] else f"estate:{p['id']}";o["history"].append(["inherited",y,p["id"],o["owner"]]);stats["inheritances"]+=1
    failures=[]
    for o in objs.values():
        if not o["origin"] or not o["owner"]:failures.append("identity")
        if o["parent"] and o["parent"] not in objs:failures.append("genealogy")
        if o["qty"]<=0:failures.append("quantity")
    multi=sum(sum(h[0] in ("sold","inherited") for h in o["history"])>=2 for o in objs.values())
    return {"seed":seed,"stats":dict(stats),"objects":objs,"multi_history":multi,"failures":failures}
