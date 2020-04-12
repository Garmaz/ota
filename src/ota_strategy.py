import random
import copy
import numpy as np

from ota_analysis import Statistics



class Strategy:
    def run(self, workers, requests, seed, maxDelay, duration, logger, results):
        self.workers = workers
        self.requests = requests
        self.seed = seed
        self.maxDelay = maxDelay
        self.duration = duration
        self.logger = logger
        self.results = results

        logger.newExp(len(workers), len(requests), maxDelay,
                      duration, type(self).__name__)
        self.statistics = Statistics(maxDelay, len(workers), len(
            requests), duration, seed, type(self).__name__)

        self.initialize()
        for request in requests:
            worker = self.assign(request)
            logger.logAssignment(worker, request)
            self.statistics.record(worker, request)
            worker.assign(request)

        results.record(self.statistics)
        logger.info(str(self.statistics))

    def getAssignments(self, workers, requests, seed, maxDelay, maxX, maxY, duration, logger, results):
        self.workers = workers
        self.requests = requests
        self.seed = seed
        self.maxDelay = maxDelay
        self.logger = logger
        self.results = results

        self.statistics = Statistics(maxDelay, len(workers), len(
            requests), duration, seed, type(self).__name__)
        logger.newExp(len(workers), len(requests), maxDelay,
                      duration, type(self).__name__)
        self.initialize()
        rows = [["Request_ID","Request_time","delay"]]
        records = [{
            "duration": duration,
            "xmax": maxX,
            "ymax": maxY,
            "maxD": maxDelay
        }]
        for request in requests:
            worker = self.assign(request)
            workerCopy = copy.copy(worker)
            self.statistics.record(worker, request)
            logger.logAssignment(worker, request)
            worker.assign(request)
            delay = workerCopy.arrivalDelay(request)
            records.append({
                "agent": workerCopy.getJsonDict(),
                "request": request.getJsonDict(),
                "delay": delay,
                "arrivetime": delay + request.time,
                "finish_time": delay + request.time + request.distance() / workerCopy.speed
            })
            rows.append([request.id,request.time, delay])
        results.record(self.statistics)
        logger.info(str(self.statistics))

        return records,rows

    def initialize(self):
        pass

    def assign(self, request):
        pass

    def isDelayInsensitive(self):
        return False

# Assignment methods


class Greedy(Strategy):
    def isDelayInsensitive(self):
        return True

    def assign(self, request):
        return min(self.workers, key=lambda a: a.arrivalDelay(request))


class Ranking(Strategy):
    def initialize(self):
        random.seed(self.seed)
        # random permutation independent of parsing for ranking
        random.shuffle(self.workers)
        for i in range(len(self.workers)):  # assign id for printing
            self.workers[i].setId(i)

    def assign(self, request):
        validWorkers = valid(self.workers, request, self.maxDelay)
        return validWorkers[0] if len(validWorkers) > 0 \
            else min(self.workers, key=lambda a: a.arrivalDelay(request))


class Random(Strategy):
    def initialize(self):
        random.seed(self.seed)

    def assign(self, request):
        validWorkers = valid(self.workers, request, self.maxDelay)
        return random.choice(validWorkers) if len(validWorkers) > 0 \
            else min(self.workers, key=lambda a: a.arrivalDelay(request))


class HighestRedundancy(Strategy):
    def initialize(self):
        self.threshold = self.maxDelay / 2
        self.adjacencyMatrix = [[1 if self.workers[i].location.distance(self.workers[j].location) < self.threshold
                                 else 0 for i in range(len(self.workers))]
                                for j in range(len(self.workers))]
        self.redundancyMatrix = [sum(self.adjacencyMatrix[i])
                                 for i in range(len(self.workers))]
        pass

    def assign(self, request):
        validWorkers = valid(self.workers, request, self.maxDelay)
        worker = max(validWorkers, key=lambda a: self.redundancyMatrix[a.id]) if len(validWorkers) > 0 \
            else min(self.workers, key=lambda a: a.arrivalDelay(request))
        self.updateMatrices(worker, request)
        return worker

    def updateMatrices(self, worker, request):
        id = worker.id
        newLocation = request.end
        for i in range(len(self.workers)):
            distance = self.workers[i].location.distance(newLocation)
            if distance < self.threshold and self.adjacencyMatrix[i][id] == 0:
                self.adjacencyMatrix[i][id] = 1
                self.adjacencyMatrix[id][i] = 1
                self.redundancyMatrix[i] += 1
            elif distance >= self.threshold and self.adjacencyMatrix[i][id] == 1:
                self.adjacencyMatrix[i][id] = 0
                self.adjacencyMatrix[id][i] = 0
                self.redundancyMatrix[i] -= 1
        self.adjacencyMatrix[id][id] = 1
        self.redundancyMatrix[id] = sum(self.adjacencyMatrix[id])


class MultiRadiusRandom(Strategy):
    def initialize(self):
        self.f = 1
        random.seed(self.seed)

    def assign(self, request):
        newThreshold = self.maxDelay
        validWorkers = valid(self.workers, request, newThreshold)
        curr_maxWT = self.statistics.maxWaitingTime if self.statistics.maxWaitingTime>self.maxDelay else float('inf')
        while len(validWorkers) == 0:
            newThreshold = newThreshold*(1+self.f)
            if newThreshold>curr_maxWT:
                break
            validWorkers = valid(self.workers, request, newThreshold)
        return random.choice(validWorkers) if len(validWorkers) > 0 \
        else min(self.workers, key=lambda a: a.arrivalDelay(request))


class DynamicRadiusRandom(Strategy):
    def initialize(self):
        self.f = 1
        random.seed(self.seed)

    def assign(self, request):
        newThreshold = self.maxDelay
        validWorkers = valid(self.workers, request, newThreshold)
        curr_maxWT = self.statistics.maxWaitingTime if self.statistics.maxWaitingTime>self.maxDelay else float('inf')
        while len(validWorkers) == 0:
            newThreshold = newThreshold*(1+self.f)
            if newThreshold>curr_maxWT:
                break
            validWorkers = valid(self.workers, request, newThreshold)
        return random.choice(validWorkers) if len(validWorkers) > 0 \
        else min(self.workers, key=lambda a: a.arrivalDelay(request))

# Utility methods


# return array of workers that can fulfill request within max time constraint
def valid(workers, request, max):
    return [worker for worker in workers if worker.arrivalDelay(request) <= max]


def getAllStrategies():
    return [Greedy(), Ranking(), Random(), HighestRedundancy(), MultiRadiusRandom()]
