import json
from random import uniform
def rand_ass(id):
    data = {}
    data["agent"] = {
        "id":id,
        "velocity":1,
        "timeavailable":uniform(0,100),
        "lastlocation":{},
        }
    t = data["agent"]["timeavailable"]+uniform(0,2)
    at = t+uniform(0,5)
    ft = at+uniform(0,5)
    x = uniform(0,100)
    y = uniform(0,100)
    data["request"]={
        "id":id,
        "start":{"x":x,"y":y},
        "end":{"x":x+uniform(-5,5),"y":y+uniform(-5,5)},
        "time":t,
    }
    data["arrivetime"]=at
    data["finish_time"]=ft
    return data

data=[]
for i in range(100):
    data.append(rand_ass(i))

with open("gen_ass.json",'w') as f:
    json.dump(data,f)

