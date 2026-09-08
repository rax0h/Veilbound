def run(seed, missions=900):
    rng,chars,stock,objects,ledger=mk_world(seed)
    stats=collections.Counter(); year=0
    for mid in range(missions):
        year=mid//18
        situation=rng.choice(SITUATIONS); surge=(rng.random()<.035)
        difficulty=min(4,rng.choices(range(5),[42,31,18,7,2])[0]+(1 if surge else 0))
        entry={"mission":mid,"year":year,"situation":situation,"surge":surge,"stages":[]}
        # Intent / intelligence
        entry["stages"]+=["intent","intelligence"]
        intel=max(.05,min(1,rng.uniform(.25,.9)-(0.12 if surge else 0)))
        # Party: actual persistent Characters, <=4; stars gate trust/access only.
        eligible=[c for c in chars if c["alive"] and c["stars"]>=max(0,difficulty-2)]
        if len(eligible)<2:
            stats["declined_no_party"]+=1; continue
        rng.shuffle(eligible); party=sorted(eligible,key=lambda c:c["condition"]+.15*rng.random(),reverse=True)[:4]
        entry["party"]=[c["id"] for c in party]; entry["stages"].append("party")
        # Preparation consumes persistent settlement inventory.
        need={"food":len(party)*rng.randint(1,3),"medicine":rng.randint(0,2+len(party)//2),
              "fuel":rng.randint(0,3),"tools":rng.randint(0,2)}
        supplied={g:min(stock[g],n) for g,n in need.items()}
        for g,n in supplied.items(): stock[g]-=n
        required=[g for g in GOODS if need[g]>0]
        prep=sum(supplied[g]/need[g] for g in required)/max(1,len(required))
        entry["supplies_consumed"]=supplied;entry["stages"].append("preparation")
        # Travel / discovery
        entry["stages"]+=["travel","discovery"]
        travel_risk=rng.uniform(.02,.18)*(1.5 if surge else 1)
        discovery=max(.05,min(1,intel+rng.uniform(-.25,.2)))
        # Decision: situation offers multiple solutions, imperfectly chosen.
        choices=APPROACH[situation]; approach=rng.choice(choices) if discovery<.45 else choices[int(rng.random()*len(choices))]
        entry["approach"]=approach;entry["stages"].append("decision")
        power=sum((c["rank"]+1)*c["condition"] for c in party)/(len(party)*5)
        challenge=.08+(difficulty+1)/5*.46+rng.uniform(-.08,.15)+(0.12 if surge else 0)
        margin=.36*power+.23*prep+.19*discovery+rng.uniform(-.18,.18)-challenge
        success=margin>0
        # Persistent costs/injury. Returned unused supplies are NOT assumed; expedition consumes what was issued.
        for c in party:
            harm=max(0,travel_risk+rng.uniform(0,.10)+(0 if success else .05)-.04*c["rank"])
            c["condition"]=max(.04,c["condition"]-harm)
            c["reputation"]+=.06 if success else -.025
            c["mission_history"].append(mid)
            # Exceptional deaths only become plausible under severe exposure; no ordinary Diamond death.
            if c["condition"]<.07 and c["rank"]<4 and rng.random()<.012*(difficulty+1):
                c["alive"]=False;stats["deaths"]+=1
        entry["stages"].append("return")
        # Consequences/rewards are physical provenance-bearing objects, never anonymous loot counters.
        rewards=[]
        if situation=="monster":
            carcasses=rng.randint(1,4) if success else rng.randint(0,1)
            for _ in range(carcasses):
                body=create_object(objects,"monster_remains",f"mission:{mid}",year)
                rewards.append(body)
                if rng.random()<.48:
                    core=create_object(objects,"monster_core",f"harvest:{body}",year,parent=body);rewards.append(core)
                if rng.random()<(.13 if not surge else .19):
                    rewards.append(create_object(objects,"Essence",f"manifestation-zone:mission:{mid}",year))
                if rng.random()<(.09 if not surge else .15):
                    rewards.append(create_object(objects,"Awakening Stone",f"manifestation-zone:mission:{mid}",year))
        elif situation=="gather" and success:
            for _ in range(rng.randint(1,4)): rewards.append(create_object(objects,"harvest_material",f"site:mission:{mid}",year))
        elif situation=="route" and success:
            # payment comes from an explicit contract treasury object/value transfer
            rewards.append(create_object(objects,"contract_payment_record",f"settlement-treasury:mission:{mid}",year))
        elif situation in ("rescue","anomaly") and success:
            rewards.append(create_object(objects,"contract_payment_record",f"institution-treasury:mission:{mid}",year))
        # assign title to party member / institution; no object disappears.
        for oid in rewards:
            owner=rng.choice(party)["id"] if objects[oid]["kind"]!="monster_remains" else "expedition_estate"
            objects[oid]["owner"]=owner;objects[oid]["history"].append(f"titled:{owner}:y{year}")
        entry["rewards"]=rewards;entry["success"]=success;entry["stages"].append("consequence")
        ledger.append(entry);stats["completed"]+=1;stats["success"]+=success;stats["failed"]+=not success;stats["surge_ops"]+=surge
        # between missions: persistent rest + economy replenishment through ordinary production, not mission magic
        for c in chars:
            if c["alive"]:c["condition"]=min(1,c["condition"]+.035)
        for g in GOODS:stock[g]+=rng.randint(0,3)

    failures=[]
    if any(e["stages"]!=list(STAGES) for e in ledger): failures.append("lifecycle")
    if any(len(e["party"])>4 for e in ledger): failures.append("party_size")
    if any(v<0 for v in stock.values()): failures.append("negative_stock")
    if any(not o["origin"] or not o["owner"] for o in objects.values()): failures.append("provenance_or_title")
    if any(o["kind"] in ("Essence","Awakening Stone","monster_core") and o["origin"].startswith("reward-table") for o in objects.values()):
        failures.append("conjured_reward")
    return {"seed":seed,"stats":dict(stats),"stock_final":stock,"characters":chars,
            "objects":objects,"ledger":ledger,"failures":failures}
