def simulate(seed, years=220):
    rng=random.Random(780000+seed)
    people={}
    for i in range(140):
        cid=f"C{i:04}"
        people[cid]={"id":cid,"age":rng.randint(16,55),"alive":True,"craft":rng.choice(CRAFTS),
                     "skill":rng.uniform(.08,.82),"reputation":0.0,"teacher":None,"knowledge":set()}
    techniques={}; books={}; lineages=[]; stats=collections.Counter()
    def tech(author,craft,year,parent=None):
        tid=f"T{len(techniques)+1:06}"
        techniques[tid]={"id":tid,"author":author,"craft":craft,"created":year,"parent":parent,
                         "correctness":rng.uniform(.58,.96),"efficiency":rng.uniform(.45,.9),
                         "difficulty":rng.uniform(.25,.85),"users":set([author]),"results":[]}
        people[author]["knowledge"].add(tid);return tid
    # founders invent from practice, not menus.
    for p in rng.sample(list(people.values()),40): tech(p["id"],p["craft"],0)
    for year in range(years):
        alive=[p for p in people.values() if p["alive"]]
        # practice produces results, reputation, and occasionally novel technique.
        for p in rng.sample(alive,min(len(alive),rng.randint(35,70))):
            known=[techniques[t] for t in p["knowledge"] if t in techniques and techniques[t]["craft"]==p["craft"]]
            if known:
                t=max(known,key=lambda x:x["efficiency"]*x["correctness"])
                quality=max(0,min(1,.5*p["skill"]+.3*t["correctness"]+.2*t["efficiency"]+rng.gauss(0,.08)))
                t["results"].append((year,p["id"],quality));p["reputation"]+=max(0,quality-.45)*.04
                p["skill"]=min(1,p["skill"]+.003*(1-t["difficulty"]))
                stats["craft_results"]+=1
                # variation is a descendant technique, preserving intellectual genealogy.
                if rng.random()<.006*p["skill"]:
                    child=tech(p["id"],p["craft"],year,t["id"])
                    techniques[child]["correctness"]=max(.15,min(1,t["correctness"]+rng.gauss(0,.07)))
                    techniques[child]["efficiency"]=max(.15,min(1,t["efficiency"]+rng.gauss(0,.07)))
                    stats["variations"]+=1
            elif rng.random()<.008*p["skill"]:
                tech(p["id"],p["craft"],year);stats["inventions"]+=1
        # apprenticeship emerges from reputation, craft match, access, and age.
        candidates=[p for p in alive if p["age"]<35 and p["teacher"] is None]
        teachers=sorted(alive,key=lambda p:p["reputation"]+p["skill"],reverse=True)
        for a in rng.sample(candidates,min(len(candidates),rng.randint(1,7))):
            pool=[t for t in teachers if t["craft"]==a["craft"] and t["id"]!=a["id"] and t["reputation"]>.05]
            if pool and rng.random()<.55:
                teacher=rng.choice(pool[:max(1,min(12,len(pool)))])
                a["teacher"]=teacher["id"];lineages.append((teacher["id"],a["id"],year));stats["apprenticeships"]+=1
        # teaching transmits knowledge imperfectly; bad/outdated knowledge can propagate.
        for a in alive:
            if a["teacher"] and people.get(a["teacher"],{}).get("alive"):
                t=people[a["teacher"]]
                available=list(t["knowledge"]-a["knowledge"])
                if available and rng.random()<.32:
                    tid=rng.choice(available);a["knowledge"].add(tid);techniques[tid]["users"].add(a["id"]);stats["transmissions"]+=1
                a["skill"]=min(1,a["skill"]+.006*t["skill"])
        # authored books preserve/access knowledge independently of living teachers.
        for p in alive:
            if p["reputation"]>.18 and p["knowledge"] and rng.random()<.012:
                tid=rng.choice(list(p["knowledge"]));bid=f"B{len(books)+1:05}"
                books[bid]={"id":bid,"author":p["id"],"technique":tid,"year":year,
                            "accuracy":max(.2,min(1,techniques[tid]["correctness"]+rng.gauss(0,.06))),"copies":1}
                stats["books"]+=1
        for b in books.values():
            if rng.random()<.025:b["copies"]+=1
            if rng.random()<.012 and b["copies"]>0:b["copies"]-=1
            if b["copies"] and rng.random()<.035:
                readers=[p for p in alive if p["craft"]==techniques[b["technique"]]["craft"]]
                if readers:
                    r=rng.choice(readers);r["knowledge"].add(b["technique"]);techniques[b["technique"]]["users"].add(r["id"]);stats["book_learning"]+=1
        # mortality can remove living knowledge; books/apprentices may preserve it.
        for p in alive:
            p["age"]+=1
            if p["age"]>65 and rng.random()<min(.25,(p["age"]-64)*.008):
                p["alive"]=False;stats["deaths"]+=1
        # recruit new generation
        for _ in range(rng.randint(1,4)):
            cid=f"C{len(people):04}";people[cid]={"id":cid,"age":16,"alive":True,"craft":rng.choice(CRAFTS),
                "skill":rng.uniform(.08,.3),"reputation":0.0,"teacher":None,"knowledge":set()}
    # A "school/tradition" is detected, never spawned: technique family transmitted to >=5 people across >=3 teacher generations.
    parent={a:t for t,a,y in lineages}
    def depth(cid):
        d=0;seen=set()
        while cid in parent and cid not in seen:
            seen.add(cid);cid=parent[cid];d+=1
        return d
    schools=[]
    for tid,t in techniques.items():
        users=t["users"]
        if len(users)>=5:
            depths=[depth(u) for u in users]
            if max(depths,default=0)>=2:
                schools.append({"root_technique":tid,"craft":t["craft"],"users":len(users),"generation_depth":max(depths)})
    # knowledge loss: techniques with no living knower and no surviving book copies are actually lost.
    living_knowledge=set().union(*(p["knowledge"] for p in people.values() if p["alive"])) if people else set()
    preserved_books={b["technique"] for b in books.values() if b["copies"]>0}
    lost=[tid for tid in techniques if tid not in living_knowledge and tid not in preserved_books]
    failures=[]
    if any(t["parent"] and t["parent"] not in techniques for t in techniques.values()):failures.append("tech_genealogy")
    if any(b["technique"] not in techniques or b["author"] not in people for b in books.values()):failures.append("book_provenance")
    return {"seed":seed,"stats":dict(stats),"techniques":techniques,"books":books,"lineages":lineages,
            "schools":schools,"lost_techniques":lost,"failures":failures}
