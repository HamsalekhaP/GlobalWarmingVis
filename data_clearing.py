import csv 
from os import listdir
from os.path import isfile, join
###
# XRK (Kosovo) has no data despite having .csv file
# United States needs to be changed to USA for correct mapping
# The same for Congo(s), Tanzania, Myanmar
# change so that countries with lower than 0 temp works
###
mypath = '../../Country_avg_temp'
onlyfiles = [f for f in listdir(mypath) if isfile(join(mypath, f))]
outputs = []
def load_data(file):
    results = []
    with open(file) as csvfile:
        reader = csv.reader(csvfile, delimiter=',')
        next(reader, None)
        count = 0
        maxTemp = float(-200)
        for row in reader:
            count += 1
            if count == 12:
                #print("new year")
                count = 0
                result = [row[3].strip(), row[4].strip(), row[1].strip(), maxTemp]
                results.append(result)
                #print('maxTemp in ' + row[1] + ' is '+ str(maxTemp))

                maxTemp = float(-200)
            
            maxTemp = float(max(maxTemp, float(row[0])))
            
    
    #print(results)
    #print(len(results))
    return results
    # with open('output.csv', 'w', newline='') as csvfile:
    #     writer = csv.writer(csvfile, delimiter=',')
    #     writer.writerow()
#load_data('../../Country_avg_temp/tas_1991_2016_GRL.csv')

for f in onlyfiles:
    filename = '../../Country_avg_temp/' + f
    #print(filename)
    outputs.extend(load_data(filename))

#print(outputs)
def write_data(file):
    header = ['country', 'id', 'year', 'temperature']
    with open(file, 'w') as csvfile:
        csvwriter = csv.writer(csvfile)
        csvwriter.writerow(header)
        csvwriter.writerows(outputs)

write_data('country_avg_temp.csv')