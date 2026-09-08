def lineage_chronicle(seed=830001, years=1000):
    rng=random.Random(seed)
    # cohort key=(generation,surname,sex,age_band,magical_rank); count
    C=collections.Counter()
    # founders
    C[(0,"Harker","M",30,0)]=1; C[(0,"Harker","F",25,0)]=1
    stats=collections.Counter(); timeline=[]; events=[]; pressure=.24;cool=0
    # named notable individuals generated only when rare events occur
    notables=[]
    for y in range(years):
        N=collections.Counter()
        # age/mortality and rare magic
        for (gen,sur,sex,age,rank),n in C.items():
            if n<=0:continue
            old={0:72,1:95,2:135,3:330,4:650,5:10**9}[rank]
            q=.0012 if age<45 else .0035 if age<65 else .012
            if age>old:q+=min(.22,(age-old)*.008)
            if rank==5:q=min(q,.001)
            deaths=sum(rng.random()<q for _ in range(n)) if n<300 else round(n*q+rng.gauss(0,max(1,math.sqrt(n*q*(1-q)))))
            deaths=max(0,min(n,deaths));surv=n-deaths;stats["deaths"]+=deaths
            # awakening opportunities preserve individual event probability; binomial approximation at large n
            elig=surv if age>=18 else 0
            aw=sum(rng.random()<.00075 for _ in range(elig)) if elig<300 else max(0,round(elig*.00075+rng.gauss(0,math.sqrt(max(.1,elig*.00075)))))
            aw=min(elig,aw)
            if aw:
                N[(gen,sur,sex,min(1000,age+1),1)]+=aw
                N[(gen,sur,sex,min(1000,age+1),rank)]+=surv-aw
                stats["awakenings"]+=aw
                if len(notables)<40:notables.append({"year":y,"event":"awakening","generation":gen,"surname":sur})
            else:N[(gen,sur,sex,min(1000,age+1),rank)]+=surv
        C=N
        # births: women 18-42; achieved family completion calibrated to closed v8.1 ~2.06 lifetime.
        births=0
        fertile=[(k,n) for k,n in C.items() if 18<=k[3]<=(42 if k[2]=="F" else 55)]
        for (gen,sur,sex,age,rank),n in fertile:
            # male descendants carry biological descent through outside female spouses too.
            annual=(.083 if sex=="F" else .052) * max(.35,1-abs(age-29)/26)
            b=sum(rng.random()<annual for _ in range(n)) if n<300 else max(0,round(n*annual+rng.gauss(0,math.sqrt(max(.1,n*annual*(1-annual))))))
            births+=b
            # 58/42 partner-vs-maternal surname; outside partners mostly non-Harker
            keep_prob=.58 if sex=="M" else .42
            keep=sum(rng.random()<keep_prob for _ in range(b)) if b<300 else round(b*keep_prob+rng.gauss(0,math.sqrt(max(.1,b*keep_prob*(1-keep_prob)))))
            keep=max(0,min(b,keep))
            # if maternal surname Harker, kept are Harker; otherwise kept retain her branch surname.
            C[(gen+1,sur,"F",0,0)]+=keep//2;C[(gen+1,sur,"M",0,0)]+=keep-keep//2
            out=b-keep
            # descendants remain biological Harkers even when surname changes; distribute branch surnames.
            for j in range(out):
                os=rng.choice(["Vale","Mercer","Dane","Holt","Reeve","Bell","Marsh","Kerr"])
                C[(gen+1,os,rng.choice("FM"),0,0)]+=1
        stats["births"]+=births
        # monster surge
        pressure=min(1.3,pressure+rng.uniform(.045,.074))
        if cool<=0 and pressure>rng.uniform(.77,.95):
            stats["surges"]+=1;cool=rng.randint(6,11);sev=max(.04,pressure*rng.uniform(.45,.85))
            D=collections.Counter()
            for k,n in C.items():
                q=sev*rng.uniform(.0002,.0015)
                d=sum(rng.random()<q for _ in range(n)) if n<300 else max(0,round(n*q+rng.gauss(0,math.sqrt(max(.1,n*q)))))
                d=min(n,d);D[k]=n-d;stats["surge_deaths"]+=d
                if d and len(notables)<40:notables.append({"year":y,"event":"surge_death","generation":k[0],"surname":k[1],"count":d})
            C=D;pressure=max(.12,pressure-rng.uniform(.46,.64))
        cool=max(0,cool-1)
        # rank practice for magical cohorts, very rare whole-character advancement
        R=collections.Counter()
        for k,n in C.items():
            gen,sur,sex,age,rank=k
            if rank>0:
                stats["missions"]+=round(n*.18)
                if rank<4:
                    adv=sum(rng.random()<.0015 for _ in range(n)) if n<300 else round(n*.0015)
                    adv=min(n,adv)
                    if adv and len(notables)<40:notables.append({"year":y,"event":"rank_advance","generation":gen,"surname":sur,"to_rank":rank+1,"count":adv})
                    R[(gen,sur,sex,age,rank+1)]+=adv;R[k]+=n-adv
                else:R[k]+=n
            else:R[k]+=n
        C=R
        if y%25==0:
            total=sum(C.values()); hs=sum(n for k,n in C.items() if k[1]=="Harker")
            mag=sum(n for k,n in C.items() if k[4]>0)
            timeline.append({"year":y,"living_descendants":total,"Harker_surname":hs,"magical":mag,
                             "max_generation":max((k[0] for k,n in C.items() if n),default=0)})
        if not C:break
    return {"seed":seed,"year":y,"stats":dict(stats),"timeline":timeline,"notables":notables,
            "summary":{"living_descendants":sum(C.values()),"living_Harker_surname":sum(n for k,n in C.items() if k[1]=="Harker"),
            "max_generation":max((k[0] for k,n in C.items() if n),default=0),
            "living_magical":sum(n for k,n in C.items() if k[4]>0),
            "surname_counts":dict(collections.Counter({s:sum(n for k,n in C.items() if k[1]==s) for s in set(k[1] for k in C)}).most_common())}}
