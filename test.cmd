REM python ./src/ota_run_extractor.py --expType syn --rdist unif --strategy Random --numWorkers 100 --numRequests 500 --duration 100 --minMaxD 0.05 --maxMaxD 0.30 --incrMaxD 0.02 --dimX 2 --dimY 2 --seed 20 --logLevel warning
REM python ./src/ota_run_extractor.py --expType syn --rdist peaks --strategy Random --numWorkers 100 --numRequests 500 --duration 100 --minMaxD 0.05 --maxMaxD 0.30 --incrMaxD 0.02 --dimX 2 --dimY 2 --seed 20 --logLevel warning
REM python ./src/ota_run_extractor.py --expType syn --rdist unif --strategy Random --numWorkers 100 --numRequests 1000 --duration 100 --minMaxD 0.1 --maxMaxD 0.50 --incrMaxD 0.5 --dimX 2 --dimY 2 --seed 20 --logLevel warning


for /l  %%y in (50, 50, 200) do (
    for /l %%x in (100, 100, 1000) do (
        REM python ./src/ota_run_extractor.py --expType syn --rdist unif --strategy Random --numWorkers %%y --numRequests %%x --duration 100 --minMaxD 0 --maxMaxD 1.5 --incrMaxD 0.2 --dimX 2 --dimY 2 --seed 20 --logLevel info
        python ./src/ota_run_extractor.py --expType syn --rdist peaks --strategy Random --numWorkers %%y --numRequests %%x --duration 100 --minMaxD 0 --maxMaxD 1.5 --incrMaxD 0.2 --dimX 2 --dimY 2 --seed 20 --logLevel info
        REM python ./src/ota_run_extractor.py --expType syn --rdist unif --strategy HighestRedundancy --numWorkers %%y --numRequests %%x --duration 100 --minMaxD 0 --maxMaxD 1.5 --incrMaxD 0.2 --dimX 2 --dimY 2 --seed 20 --logLevel info
        python ./src/ota_run_extractor.py --expType syn --rdist peaks --strategy HighestRedundancy --numWorkers %%y --numRequests %%x --duration 100 --minMaxD 0 --maxMaxD 1.5 --incrMaxD 0.2 --dimX 2 --dimY 2 --seed 20 --logLevel info
    )
)

REM python ./src/ota_run_extractor.py --expType syn --rdist peaks --strategy Random --numWorkers 100 --numRequests 1000 --duration 100 --minMaxD 0.5 --maxMaxD 2.0 --incrMaxD 0.1 --dimX 2 --dimY 2 --seed 20 --logLevel info
REM python ./src/ota_run_extractor.py --expType syn --rdist peaks --strategy HighestRedundancy --numWorkers 100 --numRequests 1000 --duration 100 --minMaxD 0.5 --maxMaxD 2.0 --incrMaxD 0.1 --dimX 2 --dimY 2 --seed 20 --logLevel info
REM python ./src/ota_run_extractor.py --expType syn --rdist peaks --strategy MultiRadiusRandom --numWorkers 100 --numRequests 1000 --duration 100 --minMaxD 0.5 --maxMaxD 2.0 --incrMaxD 0.1 --dimX 2 --dimY 2 --seed 20 --logLevel info