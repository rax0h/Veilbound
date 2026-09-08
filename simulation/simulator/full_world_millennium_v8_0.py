def full_world(seed, years=1000):
    rng=random.Random(800000+seed)
    # civilization ledger
    pop=rng.randint(1450,2300); births_total=deaths_total=0
    treasury=8500.0; currency_issued=treasury
    stock={g:rng.randint(900,1800) for g in GOODS}
    # persistent magical Characters; historical world already exists at Year 0
    chars={}
    for i in range(70):
        rank=rng.choices(range(6),[8,26,23,9,3,1])[0]
        cid=f"C{i:05}"
        chars[cid]={"id":cid,"alive":True,"age":rng.randint(18,180 if rank>=3 else 70),
                    "rank":rank,"stars":rng.randint(0,3),"condition":1.0,"wealth":rng.uniform(20,350),
                    "manifest":[rank+rng.uniform(-.35,.2) for _ in range(20)],
                    "aura_slot":rng.randrange(20),"history":[],"craft":rng.choice(CRAFTS)}
    objects={}; techniques={}; memories={}; norms={}; institutions={}
    stats=collections.Counter(); failures=[]; pressure=.24; cooldown=0
    yearly=[]
    def obj(kind,y,origin,owner,parent=None):
        oid=f"O{len(objects)+1:08}"
        objects[oid]={"id":oid,"kind":kind,"year":y,"origin":origin,"owner":owner,
                      "parent":parent,"condition":1.0,"history":[["created",y,origin,owner]]}
        return oid
    # historical assets
    for _ in range(180): obj(rng.choice(("tool","artifact","book","material")),0,"pre-observation-history",rng.choice(list(chars)))
    for year in range(years):
        p0=pop
        # Demography: heterogeneous causal annual aggregate here is only the accounting envelope;
        # explicit fatal conservation remains mandatory.
        prosperity=min(1,max(.15,sum(stock.values())/(len(GOODS)*1600)))
        # replacement-scale demographic envelope for this composition harness;
        # no population target/clamp: prosperity and annual stochasticity can push either direction.
        birth_rate=rng.uniform(.0108,.0148)*(.91+.13*prosperity)
        death_rate=rng.uniform(.0102,.0142)*(1.07-.10*prosperity)
        births=max(0,int(pop*birth_rate))
        deaths=max(0,int(pop*death_rate))
        # surge casualties added below
        pop += births-deaths; births_total+=births; deaths_total+=deaths

        # Production/consumption economy
        for g in GOODS:
            production=int(pop*rng.uniform(.13,.25))
            consumption=int(pop*rng.uniform(.11,.22))
            stock[g]=max(0,stock[g]+production-consumption)
            stats["production_units"]+=production; stats["consumption_units"]+=min(stock[g]+consumption,consumption)

        # Environmental magic + warning + surge
        pressure=min(1.3,pressure+rng.uniform(.045,.074))
        warning=max(0,min(1,(pressure-.5)*1.7+rng.uniform(-.14,.14)))
        surge=cooldown<=0 and pressure>rng.uniform(.77,.95)
        if surge:
            stats["surges"]+=1; cooldown=rng.randint(6,11)
            manifestations=max(12,int(rng.gauss(125*pressure,22)))
            stats["monster_manifestations"]+=manifestations
            # actual adventurer deployment
            alive=[c for c in chars.values() if c["alive"]]
            party=sorted(alive,key=lambda c:(c["rank"],c["condition"],c["stars"]),reverse=True)[:min(4,len(alive))]
            prep=min(1,(stock["food"]+stock["medicine"]+stock["tools"])/2400)
            defense=(sum(c["rank"]+1 for c in party)/max(1,6*len(party)))*.45+prep*.25+warning*.18+.12
            severity=max(.05,pressure*rng.uniform(.75,1.25)-defense)
            casualties=min(pop,int(pop*severity*rng.uniform(.0003,.0022)))
            pop-=casualties; deaths_total+=casualties; stats["surge_deaths"]+=casualties
            for g in ("food","medicine","tools"):
                spent=min(stock[g],rng.randint(8,35));stock[g]-=spent;stats["surge_supply_spent"]+=spent
            # persistent recoveries: remains/cores and occasional environmental Essences/Stones
            recovered=max(0,int(manifestations*(.18+.3*defense)))
            for j in range(recovered):
                owner=rng.choice(party)["id"] if party else "estate:civilization"
                body=obj("monster_remains",year,f"surge:{year}",owner);stats["recovered_objects"]+=1
                if rng.random()<.38: obj("monster_core",year,f"harvest:{body}",owner,body);stats["cores"]+=1
                if rng.random()<.06: obj("Essence",year,f"surge-manifestation:{year}",owner);stats["essences"]+=1
                if rng.random()<.04: obj("Awakening Stone",year,f"surge-manifestation:{year}",owner);stats["stones"]+=1
            # participation develops individual manifestations only
            for c in party:
                slots=rng.sample(range(20),rng.randint(1,4))
                for s in slots: c["manifest"][s]=min(5,c["manifest"][s]+rng.uniform(.015,.055))
                c["history"].append(["surge",year])
                stats["adventurer_deployments"]+=1
            # memory antecedent
            mid=f"M{len(memories)+1:06}"
            memories[mid]={"id":mid,"event":"monster_surge","year":year,"strength":min(1,.35+severity),"retell":0}
            pressure=max(.12,pressure-rng.uniform(.46,.64))
        cooldown=max(0,cooldown-1)

        # Ordinary expeditions
        if year%1==0:
            for _ in range(rng.randint(3,8)):
                alive=[c for c in chars.values() if c["alive"]]
                if len(alive)<2: break
                difficulty=rng.randint(0,3)
                eligible=[c for c in alive if c["stars"]>=max(0,difficulty-2)]
                if len(eligible)<2: continue
                party=rng.sample(eligible,min(4,len(eligible)))
                need={g:rng.randint(0,3) for g in ("food","medicine","tools")}
                if any(stock[g]<n for g,n in need.items()): stats["missions_declined_supply"]+=1;continue
                for g,n in need.items():stock[g]-=n
                intel=rng.uniform(.25,.9); power=sum(c["rank"]+1 for c in party)/(6*len(party))
                success=.45*power+.25*intel+.22*rng.random() > .18+difficulty*.13
                stats["missions"]+=1;stats["mission_success"]+=success;stats["mission_failure"]+=not success
                for c in party:
                    c["history"].append(["mission",year,success])
                    for s in rng.sample(range(20),rng.randint(1,3)):
                        c["manifest"][s]=min(5,c["manifest"][s]+rng.uniform(.004,.025))
                if success:
                    payer=min(treasury,rng.uniform(4,18));treasury-=payer
                    share=payer/len(party)
                    for c in party:c["wealth"]+=share
                    stats["contract_currency_paid"]+=payer
                    if rng.random()<.3: obj("harvest_material",year,f"expedition:{year}",rng.choice(party)["id"])

        # Craft/knowledge: transform real materials; techniques emerge from practice
        mats=[o for o in objects.values() if o["condition"]>0 and o["kind"] in ("monster_remains","harvest_material")]
        if mats and rng.random()<.7:
            src=rng.choice(mats); owner=chars.get(src["owner"])
            if owner and owner["alive"]:
                src["condition"]=0
                processed=obj("processed_material",year,f"processing:{src['id']}",owner["id"],src["id"])
                stats["processed"]+=1
                if rng.random()<.18:
                    aid=obj("artifact",year,f"craft:{owner['id']}",owner["id"],processed);stats["artifacts"]+=1
                    tid=f"T{len(techniques)+1:06}"
                    if rng.random()<.08:
                        techniques[tid]={"id":tid,"author":owner["id"],"year":year,"correctness":rng.uniform(.5,.98)}
                        stats["techniques"]+=1

        # Culture: memory -> repeated practice -> norm -> institution
        for m in memories.values():
            if rng.random()<m["strength"]*.08:
                m["retell"]+=1;m["strength"]=min(1,m["strength"]+.006);stats["retellings"]+=1
            else:m["strength"]=max(0,m["strength"]-.004)
            key="surge_preparedness"
            if m["strength"]>.3 and rng.random()<.035: stats["surge_practice"]+=1
        if stats["surge_practice"]>=12 and "surge_preparedness" not in norms:
            norms["surge_preparedness"]={"formed":year,"source":"accumulated_surge_memory"};stats["norms"]+=1
        if "surge_preparedness" in norms and year-norms["surge_preparedness"]["formed"]>15 and "surge_office" not in institutions:
            institutions["surge_office"]={"founded":year,"origin_norm":"surge_preparedness"};stats["institutions"]+=1

        # Character aging, rank continuity, inheritance.
        for c in list(chars.values()):
            if not c["alive"]: continue
            c["age"]+=1
            # whole-character bottleneck only; no generic XP/calendar rank.
            threshold=c["rank"]+1
            if c["rank"]<5 and all(v>=threshold for v in c["manifest"]):
                c["rank"]+=1;stats[f"rank_to_{RANKS[c['rank']]}"]+=1
            # rank-aware senescence; Diamond ordinary old-age mortality false.
            old={0:70,1:95,2:135,3:330,4:650,5:10**9}[c["rank"]]
            if c["age"]>old and c["rank"]<5 and rng.random()<min(.18,(c["age"]-old)*.006):
                c["alive"]=False;stats["character_deaths"]+=1
                owned=[o for o in objects.values() if o["owner"]==c["id"] and o["condition"]>0]
                heirs=[x for x in chars.values() if x["alive"] and x["id"]!=c["id"]]
                newowner=rng.choice(heirs)["id"] if heirs else f"estate:{c['id']}"
                for o in owned:o["owner"]=newowner;o["history"].append(["inherited",year,c["id"],newowner]);stats["inheritances"]+=1

        # New magical people emerge from same population envelope; not quotas.
        if rng.random()<min(.45,pop/8000):
            cid=f"C{len(chars):05}";chars[cid]={"id":cid,"alive":True,"age":18,"rank":1,"stars":0,"condition":1.0,
                "wealth":rng.uniform(10,80),"manifest":[1+rng.uniform(-.2,.08) for _ in range(20)],
                "aura_slot":rng.randrange(20),"history":[["confluence",year]],"craft":rng.choice(CRAFTS)}
            stats["new_magical_characters"]+=1

        # Currency source: taxes explicitly transfer into treasury; no minting here.
        tax=pop*rng.uniform(.001,.004); treasury+=tax; currency_issued+=tax
        # fatal accounting
        expected=p0+births-deaths-(stats["surge_deaths"]-sum(y.get("surge_deaths_delta",0) for y in yearly))
        # record per-year surge delta separately for exact conservation
        prev_sd=sum(y.get("surge_deaths_delta",0) for y in yearly)
        current_sd=stats["surge_deaths"]-prev_sd
        if pop != p0+births-deaths-current_sd: failures.append(["population_conservation",year])
        yearly.append({"year":year,"pop":pop,"births":births,"deaths":deaths,"surge_deaths_delta":current_sd,
                       "treasury":round(treasury,2),"living_magical":sum(c["alive"] for c in chars.values()),
                       "surges":stats["surges"]})
        if pop<=0: break

    # hard invariants
    if any(c["stars"]>3 for c in chars.values()):failures.append(["society_star_cap"])
    if any(len(c["manifest"])!=20 for c in chars.values()):failures.append(["manifest_count"])
    if any(not 0<=c["aura_slot"]<20 for c in chars.values()):failures.append(["aura"])
    if any(o["parent"] and o["parent"] not in objects for o in objects.values()):failures.append(["genealogy"])
    if any(v<0 for v in stock.values()):failures.append(["inventory_negative"])
    return {"seed":seed,"year_reached":year+1,"population":pop,"births":births_total,"deaths":deaths_total,
            "treasury":treasury,"stock":stock,"stats":dict(stats),"chars":chars,"objects":objects,
            "techniques":techniques,"memories":memories,"norms":norms,"institutions":institutions,
            "yearly":yearly,"failures":failures}
