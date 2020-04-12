import argparse
from datetime import datetime as dt
from os import mkdir

import numpy as np
import copy
import time

from ota_io import extractRequests
from ota_io import JsonAssignmentWriter
from ota_io import CsvDelayWriter
from ota_io import DelayPloter
from ota_io import Results
from ota_io import Logger

from ota_strategy import getAllStrategies


import ota_request_generation
import ota_worker_generation



def run(args):
    Start = time.time()
    result_dir = "./exp/exp_"+\
    str(dt.now().year)+"_"+\
    str(dt.now().month)+"_"+\
    str(dt.now().day)+"_"+\
    str(dt.now().hour)+"h"+\
    str(dt.now().minute)+"min"

    if args.expType == "real":
        result_dir+="_"+args.expType+"_"+args.strategy+"/"
        try:
            mkdir(result_dir)
        except:
            pass
        results = Results(result_dir+"realData_"+args.requestsFile+"_"+args.strategy+".csv")
        logger = Logger(result_dir+"realData_"+args.requestsFile+"_"+args.strategy+".txt", args.logLevel, Start)
        requests = extractRequests(args.requestsFile)
        duration = (max(requests, key = lambda r : r.time)).time
    elif args.expType == "syn":
        result_dir+="_"+args.expType+"_"+args.rdist+"_"+args.strategy+"/"
        try:
            mkdir(result_dir)
        except:
            pass
        results = Results(result_dir+"synData_"+args.rdist+"_"+args.strategy+"_"+str(args.numRequests)+" requests_"+str(args.numWorkers)+" workers.csv")
        logger = Logger(result_dir+"synData_"+args.rdist+"_"+args.strategy+"_"+str(args.numRequests)+" requests_"+str(args.numWorkers)+"workers.txt", args.logLevel, Start)
        if args.rdist == "unif":
            requests = ota_request_generation.generate_uniform(args.numRequests, args.duration,
                                                           args.seed + 1, args.dimX, args.dimY)
        elif args.rdist == "peaks":
            requests = ota_request_generation.generate_peaks(args.numRequests, args.duration,
                                                           args.seed + 1, args.dimX, args.dimY)
        duration = args.duration
    else:
        logger.warning("exp type error")
        logger.close()
        results.close()
        return

    requests.sort(key=lambda r: r.time)
    workers = ota_worker_generation.generate_uniform(args.numWorkers, args.seed + 2, args.dimX, args.dimY)
    for strategy in getAllStrategies():
        if type(strategy).__name__ == args.strategy:
            if args.strategy == "Greedy":
                mD = 0
                workersCopy = copy.deepcopy(workers)
                assignments = strategy.getAssignments(workersCopy, requests, args.seed, mD, args.dimX, args.dimY, args.duration, logger, results)
                jsonAssignmentWriter = JsonAssignmentWriter(result_dir+"Assignments_"+"threshold="+str(mD)+".json")
                jsonAssignmentWriter.write(assignments[0])
                csvDelayWriter = CsvDelayWriter(result_dir+"Assignments_"+"threshold="+str(mD)+".csv")
                csvDelayWriter.write(assignments[1])
                delayPloter = DelayPloter(result_dir+"Assignments_"+"threshold="+str(mD))
                delayPloter.bar(assignments[1],mD)
                delayPloter.hist(assignments[1],mD)
            else:
                for mD in np.arange(args.minMaxD, args.maxMaxD, args.incrMaxD):
                    workersCopy = copy.deepcopy(workers)
                    assignments = strategy.getAssignments(workersCopy, requests, args.seed, mD, args.dimX, args.dimY, args.duration, logger, results)
                    jsonAssignmentWriter = JsonAssignmentWriter(result_dir+"Assignments_"+"threshold="+str(mD)+".json")
                    jsonAssignmentWriter.write(assignments[0])
                    csvDelayWriter = CsvDelayWriter(result_dir+"Assignments_"+"threshold="+str(mD)+".csv")
                    csvDelayWriter.write(assignments[1])
                    delayPloter = DelayPloter(result_dir+"Assignments_"+"threshold="+str(mD))
                    delayPloter.bar(assignments[1],mD)
                    delayPloter.hist(assignments[1],mD)
    logger.Runtime()
    logger.close()
    results.close()
    End = time.time()


def main():
    parser = argparse.ArgumentParser()
    ##
    # Arguments:
    #  For both types of experiments
    #       expType: experiment type (real or synthetic data)
    #       numWorkers: to determine numbers of workers to use for run
    #       maxD: used to set maximum delay parameter in run
    #       seed: seed used to derive seeds for random generation of data and random assignment
    #       assignmentsFile: filename of output results file
    #       dimX, dimY: to set range of locations workers are generated in
    #  For real dataset experiments:
    #       requests file: filename of real dataset for requests
    #  For synthetic dataset experiments:
    #       numRequests: number of requests to generate
    #       duration: time period of requests (generated or not)
    ##
    parser.add_argument(
        "--expType", help="real for real request dataset, syn for synthetic dataset", required=True, type=str
    )
    parser.add_argument(
        "--strategy", help="Greedy or Random or Ranking or HighestRedundancy", required=True, type=str
    )
    parser.add_argument(
        "--numWorkers", help="number of workers to generate", required=True, type=int
    )
    parser.add_argument(
        "--numRequests", help="number of requests to generate in synthetic dataset", required=False, type=int
    )
    parser.add_argument(
        "--duration", help="time period of requests in synthetic dataset", required=False, type=float
    )
    parser.add_argument(
        "--minMaxD", help="minimum maximum delay parameter", required=True, type=float
    )
    parser.add_argument(
        "--maxMaxD", help="maximum maximum delay parameter", required=True, type=float
    )
    parser.add_argument(
        "--incrMaxD", help="increment of maximum delay parameter", required=True, type=float
    )
    parser.add_argument(
        "--dimX", help="maximum x coordinate for generating workers", required=True, type=float
    )
    parser.add_argument(
        "--dimY", help="maximum y coordinate for generating workers", required=True, type=float
    )
    parser.add_argument(
        "--seed", help="random seed", required=True, type=int
    )
    parser.add_argument(
        "--requestsFile", help="filename of input real request data", required=False, type=str
    )
    parser.add_argument(
        "--resultsFile", help="filename of output results file", required=False, type=str
    )
    parser.add_argument(
        "--assignmentsFile", help="filename of output assignments file", required=False, type=str
    )
    parser.add_argument(
        "--loggerFile", help="filename of output log file", required=False, type=str
    )
    parser.add_argument(
        "--logLevel", help="intensity level of logging (fine, info, warning, off)", required=True, type=str
    )
    parser.add_argument(
        "--rdist", help="request distribution (peaks, unif)", required=False, type=str
    )
    args = parser.parse_args()
    run(args)

if __name__ == "__main__":
    main()