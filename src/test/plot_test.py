import matplotlib.pyplot as plt

data = [
    ["id", "time","delay"],
    [1,0.2,0.1],
    [2,0.1,0.3],
    [3,0.15,0.35]
]
temp = data[1:]
temp.sort(key = lambda d:d[1])
newdata = [data[0]]+temp

#create plot

fig, ax = plt.subplots( nrows=1, ncols=1 )
# plt.bar([str(x[0]) for x in newdata[1:]],[x[2] for x in newdata[1:]])
plt.hist([x[2] for x in newdata[1:]])
ax.axvline(x=0.1, color='r', linestyle='dashed', linewidth=2)
plt.plot([0.1])
plt.show()
# fig.savefig("test.png")
# plt.close(fig)

print(newdata)
