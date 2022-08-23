#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#include <iostream>

#include "HTTPRequest.hpp"
#include "pn532.h"
#include "pn532_rpi.h"

using namespace std;

const string NODE_SERVER_URL = "http://192.168.0.25:3031";

void readNFC(uint32_t pn532_error, PN532 pn532, uint8_t* buff) {
    printf("Reading blocks...\r\n");
    char valueToPrint[128] = "";
    bool isPrinting = false;
    bool breakMainLoop = false;
    for (uint8_t block_number = 6; block_number < 135; block_number++) {
        pn532_error = PN532_Ntag2xxReadBlock(&pn532, buff, block_number);
        if (pn532_error != PN532_ERROR_NONE) {
            break;
        }

        printf("%d: ", block_number);

        for (uint8_t i = 0; i < 4; i++) {
            if (block_number == 6 && i == 1) {
                isPrinting = true;
            }
            if (isPrinting && buff[i] == 254) {
                isPrinting = false;
                breakMainLoop = true;
                break;
            }
            if (isPrinting) {
                // printf("\n Char %c ", buff[i]);
                // printf(" int: %i \n", buff[i]);
                strncat(valueToPrint, (char*)&buff[i], 1);
            }

            // printf("%02x ", buff[i]);
            // printf("%c ", buff[i]);
        }

        if (breakMainLoop) {
            break;
        }

        // printf("\r\n");
    }
    printf("%s", valueToPrint);
    try {
        const string requestURL =
            NODE_SERVER_URL + "/?id=" + (string)valueToPrint;
        http::Request request{requestURL};

        const auto response = request.send("GET");
        std::cout << std::string{response.body.begin(), response.body.end()}
                  << '\n';  // print the result
    } catch (const std::exception& e) {
        std::cerr << "Request failed, error: " << e.what() << '\n';
    }

    printf("\r\n");
    if (pn532_error) {
        printf("Error: 0x%02x\r\n", pn532_error);
    }
}

int main(int argc, char** argv) {
    uint8_t buff[255];
    uint8_t uid[MIFARE_UID_MAX_LENGTH];
    uint32_t pn532_error = PN532_ERROR_NONE;
    int32_t uid_len = 0;
    printf("Hello!\r\n");
    cout << "NFC Reader App" << endl;
    PN532 pn532;
    PN532_SPI_Init(&pn532);
    // PN532_I2C_Init(&pn532);
    // PN532_UART_Init(&pn532);
    if (PN532_GetFirmwareVersion(&pn532, buff) == PN532_STATUS_OK) {
        printf("Found PN532 with firmware version: %d.%d\r\n", buff[1],
               buff[2]);
    } else {
        return -1;
    }
    PN532_SamConfiguration(&pn532);
    printf("Waiting for RFID/NFC card...\r\n");
    int* lastUID = (int*)malloc(7 * sizeof(int));
    while (1) {
        // Check if a card is available to read
        uid_len =
            PN532_ReadPassiveTarget(&pn532, uid, PN532_MIFARE_ISO14443A, 1000);
        if (uid_len == PN532_STATUS_ERROR) {
            // printf(".");
        } else {
            int* currentUID = (int*)malloc(7 * sizeof(int));
            bool isDifferent = false;
            // printf("Found card with UID: ");
            for (uint8_t i = 0; i < uid_len; i++) {
                currentUID[i] = uid[i];
                // printf("%02x ", uid[i]);
            }
            // printf("\r\n");
            for (uint8_t i = 0; i < 7; i++) {
                // printf("lastUID[i]: %i \n", lastUID[i]);
                // printf("currentUID[i]: %i \n", currentUID[i]);
                if (lastUID[i] != currentUID[i]) {
                    // printf("is different \n");
                    isDifferent = true;
                    break;
                }
            }
            if (isDifferent) {
                readNFC(pn532_error, pn532, buff);
                free(lastUID);
                lastUID = currentUID;
                isDifferent = false;
            } else {
                free(currentUID);
            }
        }
    }
}
