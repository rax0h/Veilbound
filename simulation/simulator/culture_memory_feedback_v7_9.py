def simulate(seed, years=260):
    rng=random.Random(790000+seed)
    towns={}
    for i in range(7):
        towns[f"S{i}"]={"id":f"S{i}","pop":rng.randint(300,2200),"memories":{}, "norms":{}, "institutions":{},
                        "archives":{}, "practices":collections.Counter(), "history":[]}
    stats=collections.Counter()
    def remember(t,event,year,severity,witnesses):
        mid=f"M{len(t['memories'])+1:06}"
        t["memories"][mid]={"id":mid,"event":event,"origin_year":year,"strength":min(1,.15+severity*.55+witnesses*.25),
                            "retellings":0,"records":0,"distort":0.0}
        t["history"].append(("event",year,event,mid));return mid
    for year in range(years):
        for t in towns.values():
            # causal events create memories; no culture is spawned without antecedent history
            if rng.random()<.055:
                ev=rng.choices(EVENTS,[16,8,15,12,13,8,5])[0]
                sev=rng.uniform(.2,1); wit=rng.uniform(.15,.95)
                mid=remember(t,ev,year,sev,wit);stats["events"]+=1
                if sev>.72 and rng.random()<.5:
                    t["archives"][mid]={"memory":mid,"author":f"recorder:{year}:{t['id']}",
                                       "created":year,"accuracy":max(.25,1-rng.uniform(0,.25))}
                    t["memories"][mid]["records"]+=1;stats["records"]+=1
            # memories decay unless retold, practiced, recorded, or materially reinforced
            for m in list(t["memories"].values()):
                recorded=m["id"] in t["archives"]
                retell=rng.random()<m["strength"]*(.07 + .07*recorded)
                if retell:
                    m["retellings"]+=1;m["strength"]=min(1,m["strength"]+.018);m["distort"]=min(.75,m["distort"]+rng.uniform(0,.012))
                    stats["retellings"]+=1
                else:m["strength"]=max(0,m["strength"]-(.006 if recorded else .012))
            # repeated behavior arises from remembered causes.
            mapping={"monster_surge":"surge_drill","famine":"winter_store","famous_expedition":"road_watch",
                     "craft_breakthrough":"apprentice_feast","migration":"guest_right",
                     "political_crisis":"market_oath","festival_origin":"memorial_day"}
            for m in t["memories"].values():
                if m["strength"]>.28 and rng.random()<m["strength"]*.16:
                    p=mapping[m["event"]];t["practices"][p]+=1;stats["practice_events"]+=1
            # norms only emerge after repeated practice, preserving antecedent links.
            for p,count in list(t["practices"].items()):
                if count>=8 and p not in t["norms"]:
                    sources=[m["id"] for m in t["memories"].values() if mapping[m["event"]]==p and m["strength"]>.1]
                    if sources:
                        t["norms"][p]={"practice":p,"formed":year,"sources":sources,"adherence":rng.uniform(.35,.75)}
                        stats["norms"]+=1
            # institutions emerge only where a norm has sustained participation.
            for p,n in list(t["norms"].items()):
                age=year-n["formed"]
                if age>12 and p not in t["institutions"] and t["practices"][p]>=18 and rng.random()<.025*n["adherence"]:
                    t["institutions"][p]={"origin_norm":p,"founded":year,"capacity":rng.uniform(.2,.65)}
                    stats["institutions"]+=1
            # Feedback into future people is access/expectation, not arbitrary stat buffs:
            # institutions cause actual participation which reinforces practice and preserves memory.
            for p,inst in t["institutions"].items():
                participants=int(t["pop"]*.002*inst["capacity"])
                if participants:
                    t["practices"][p]+=1;stats["institution_participations"]+=participants
                    for sid in t["norms"][p]["sources"]:
                        if sid in t["memories"]:t["memories"][sid]["strength"]=min(1,t["memories"][sid]["strength"]+.002)
            # migration transmits culture imperfectly between settlements
            if rng.random()<.035:
                other=rng.choice([x for x in towns.values() if x is not t])
                transferable=list(t["norms"])
                if transferable:
                    p=rng.choice(transferable);other["practices"][p]+=rng.randint(1,3);stats["cultural_transfers"]+=1
        # population drift just scales participation, no rescue clamp
        for t in towns.values(): t["pop"]=max(0,int(t["pop"]*rng.uniform(.997,1.004)))
    # forgotten memories and causality validation
    failures=[]; forgotten=0
    for t in towns.values():
        forgotten+=sum(m["strength"]<=.01 for m in t["memories"].values())
        for p,n in t["norms"].items():
            if not n["sources"]:failures.append("norm_without_history")
            if any(s not in t["memories"] for s in n["sources"]):failures.append("missing_memory")
        for p,i in t["institutions"].items():
            if i["origin_norm"] not in t["norms"]:failures.append("institution_without_norm")
    return {"seed":seed,"towns":towns,"stats":dict(stats),"forgotten":forgotten,"failures":failures}
