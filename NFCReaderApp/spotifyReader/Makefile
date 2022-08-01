CC = g++ -Wall -g -std=c++11
DLIBS = -lwiringPi
INC_DIR = ../
SRCS = $(wildcard *.cc)
all: $(SRCS:.cc=.exe)
.PHONY: clean
%.exe: %.o pn532.o pn532_rpi.o
	$(CC) -Wall -o $@ $^ $(DLIBS)
%.o: %.cc
	$(CC) -Wall -c $^ $(DLIBS) -I$(INC_DIR)
pn532.o pn532_rpi.o: $(INC_DIR)pn532.c $(INC_DIR)pn532_rpi.c
	$(CC) -Wall -c $(INC_DIR)pn532.c
	$(CC) -Wall -c $(INC_DIR)pn532_rpi.c
clean:
	rm *.o *.exe $(INC_DIR)*.o
