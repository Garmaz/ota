import csv
import json

import matplotlib.pyplot as plt
import time

from ota_lang import Worker
from ota_lang import Request
from ota_lang import Location

# Extract requests from csv file


def extractRequests(fileName):
    f = open(filename, 'w')
    with open(src) as csv_file:
        csv_reader = csv.reader(csv_file)
        requests = [Request(Location(float(row[1]), float(row[2])),
                            Location(float(row[3]), float(row[4])),
                            float(row[0])) for row in csv_reader]
        return requests


class Logger:
    def fine(self, string):
        if self.level == "fine" or self.level == "info" or self.level == "warning":
            self.log(string)

    def info(self, string):
        if self.level == "warning" or self.level == "info":
            self.log(string)

    def warning(self, string):
        if self.level == "warning":
            self.log(string)

    def newExp(self, numWorkers, numRequests, max, duration, strategy):
        self.info("\n" + "============================================")
        self.info("Experiment: " + str(numWorkers) + " workers, "
                  + str(numRequests) + " requests, over duration "
                  + str(duration) + " for max waiting time of "
                  + str(max) + " using strategy " + str(strategy))
        self.info("============================================")

    def log(self, string):
        self.file.write(string + "\n")

    def logAssignment(self, worker, request):
        self.warning("Assign " + str(worker) + " to " + str(request) +
                  ". Wait= " + str(worker.arrivalDelay(request)))

    def append(self):
        self.file = open(self.filename, "a")

    def Runtime(self):
        self.End = time.time()
        delta = self.End-self.Start
        sec = delta%60
        mins = (delta-sec)/60
        self.log("Runtime: "+str(mins)+"mins_"+str(sec)+"secs")

    def close(self):
        self.file.close()

    def __init__(self, filename, level, Strat):
        self.level = level
        self.filename = filename
        self.file = open(filename, "w")
        self.Start =  Strat


class JsonAssignmentWriter:
    def __init__(self, filename):
        self.filename = filename

    def write(self, assignments):
        with open(self.filename, "w") as write_file:
            json.dump(assignments, write_file)


class Results:
    def record(self, statistics):
        self.writer.writerow(statistics.getRow())

    def close(self):
        self.file.close()

    def __init__(self, filename):
        self.filename = filename
        self.file = open(self.filename, "w", newline="")
        self.writer = csv.writer(self.file, delimiter=',')
        self.writer.writerow(["strat", "max", "num workers", "num req",
                              "dur", "seed", "avg wt", "max wt", "num failed"])


class CsvDelayWriter:
    def __init__(self, filename):
        self.filename = filename

    def write(self, rows):
        with open(self.filename, "w", newline="") as write_file:
            self.writer = csv.writer(write_file, delimiter=",")
            self.writer.writerows(rows)


class DelayPloter:
    def __init__(self, filename):
        self.filename = filename

    def bar(self, data, th):
        title = "Bar_"+"Threshold= "+str(th)
        fig, ax = plt.subplots()
        plt.bar([str(x[0]) for x in data[1:]], [x[2] for x in data[1:]])
        plt.title(title)
        plt.xlabel("Request ID")
        plt.ylabel("Delay")
        plt.savefig(self.filename+"_Bar.png")
        plt.close(fig)

    def hist(self, data, th):
        title = "Hist_"+"Threshold= "+str(th)
        fig, ax = plt.subplots()
        plt.hist( [x[2] for x in data[1:]],bins=int(len(data[1:])/10))
        ax.axvline(x=th, color='r', linestyle='dashed', linewidth=1)
        plt.title(title)
        plt.xlabel("Delay")
        plt.ylabel("Count")
        plt.savefig(self.filename+"_Hist.png")
        plt.close(fig)
